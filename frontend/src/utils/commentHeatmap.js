const ACTIVITY_ROOT_SEGMENT = "your_instagram_activity";

const TIMESTAMP_KEYS = [
  "timestamp",
  "time",
  "date",
  "created_at",
  "created_time",
  "value"
];

const MIN_PLAUSIBLE_UNIX_SECONDS = 946684800; // 2000-01-01
const MAX_PLAUSIBLE_UNIX_SECONDS = 4102444800; // 2100-01-01

function coerceCollection(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return Object.values(value);
  }
  return null;
}

const ACTIVITY_SOURCE_DESCRIPTORS = [
  {
    id: "comments.story",
    family: "comments",
    label: "Story comments",
    folder: "comments",
    matchFile: (fileName) => fileName.toLowerCase() === "hype.json",
    parsePayload: (payload) => payload?.comments_story_comments
  },
  {
    id: "comments.post",
    family: "comments",
    label: "Post comments",
    folder: "comments",
    matchFile: (fileName) => /^post_comments_.*\.json$/i.test(fileName),
    parsePayload: (payload) => payload
  },
  {
    id: "likes.comment",
    family: "likes",
    label: "Liked comments",
    folder: "likes",
    matchFile: (fileName) => fileName.toLowerCase() === "liked_comments.json",
    parsePayload: (payload) => coerceCollection(payload?.likes_comment_likes)
  },
  {
    id: "likes.post",
    family: "likes",
    label: "Liked posts",
    folder: "likes",
    matchFile: (fileName) => fileName.toLowerCase() === "liked_posts.json",
    parsePayload: (payload) => coerceCollection(payload?.likes_media_likes ?? payload)
  }
];

const FAMILY_COLORS = {
  comments: "#4f46e5",
  likes: "#dc2626"
};

const WEEKDAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fileBelongsToActivityFolder(file, folderName) {
  const relativePath = String(file.webkitRelativePath || "").toLowerCase();
  const normalizedPath = relativePath.replace(/\\/g, "/");
  const pathParts = normalizedPath.split("/");
  const activityIndex = pathParts.indexOf(ACTIVITY_ROOT_SEGMENT);
  if (activityIndex < 0) {
    return false;
  }
  return pathParts[activityIndex + 1] === folderName;
}

function createEmptySourceStats() {
  return {
    filesParsed: 0,
    itemsSeen: 0,
    validTimestamps: 0,
    skippedItems: 0
  };
}

export function getActivitySources() {
  return ACTIVITY_SOURCE_DESCRIPTORS.map((source) => ({
    id: source.id,
    family: source.family,
    label: source.label
  }));
}

export function discoverActivityFiles(fileList) {
  const files = Array.from(fileList || []);
  const activityFiles = files.filter((file) => {
    const relativePath = String(file.webkitRelativePath || "").toLowerCase();
    return relativePath.includes(`${ACTIVITY_ROOT_SEGMENT}/`);
  });

  const sourceMatches = ACTIVITY_SOURCE_DESCRIPTORS.map((descriptor) => {
    const matchedFiles = files.filter(
      (file) =>
        fileBelongsToActivityFolder(file, descriptor.folder) &&
        descriptor.matchFile(String(file.name || ""))
    );
    return {
      id: descriptor.id,
      family: descriptor.family,
      label: descriptor.label,
      folder: descriptor.folder,
      files: matchedFiles
    };
  });

  const matchedFilesByFolder = {
    comments: files.filter((file) => fileBelongsToActivityFolder(file, "comments")),
    likes: files.filter((file) => fileBelongsToActivityFolder(file, "likes"))
  };

  return {
    allFiles: files,
    activityFiles,
    matchedFilesByFolder,
    sourceMatches,
    parseTargetFiles: sourceMatches.flatMap((source) => source.files),
    parseTargetPaths: sourceMatches.flatMap((source) =>
      source.files.map((file) => file.webkitRelativePath || file.name)
    )
  };
}

async function parseJsonFile(file) {
  try {
    const text = await file.text();
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON in ${file?.name || "unknown file"}.`);
  }
}

function normalizeUnixTimestamp(value) {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) {
    return null;
  }
  const absValue = Math.abs(asNumber);
  const isMilliseconds = absValue >= 1e12;
  const secondsValue = isMilliseconds ? asNumber / 1000 : asNumber;

  if (secondsValue < MIN_PLAUSIBLE_UNIX_SECONDS || secondsValue > MAX_PLAUSIBLE_UNIX_SECONDS) {
    return null;
  }

  const milliseconds = isMilliseconds ? asNumber : asNumber * 1000;
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return milliseconds;
}

function collectTimestampCandidates(input, candidates, seenObjects) {
  if (input == null) {
    return;
  }

  if (typeof input === "number" || typeof input === "string") {
    candidates.push(input);
    return;
  }

  if (typeof input !== "object") {
    return;
  }

  if (seenObjects.has(input)) {
    return;
  }
  seenObjects.add(input);

  if (Array.isArray(input)) {
    for (const item of input) {
      collectTimestampCandidates(item, candidates, seenObjects);
    }
    return;
  }

  for (const key of TIMESTAMP_KEYS) {
    if (input[key] != null) {
      candidates.push(input[key]);
    }
  }

  for (const value of Object.values(input)) {
    if (typeof value === "object" && value != null) {
      collectTimestampCandidates(value, candidates, seenObjects);
    }
  }
}

function extractTimestampFromValue(input) {
  const candidates = [];
  collectTimestampCandidates(input, candidates, new WeakSet());

  for (const candidate of candidates) {
    const normalized = normalizeUnixTimestamp(candidate);
    if (normalized != null) {
      return normalized;
    }
  }

  return null;
}

function extractTimestampMs(activityItem) {
  if (!activityItem || typeof activityItem !== "object") {
    return null;
  }

  const directCandidates = [
    activityItem.timestamp,
    activityItem.time,
    activityItem.date,
    activityItem.created_at,
    activityItem.created_time
  ];

  for (const candidate of directCandidates) {
    const normalized = extractTimestampFromValue(candidate);
    if (normalized != null) {
      return normalized;
    }
  }

  return extractTimestampFromValue(activityItem.string_map_data ?? activityItem);
}

function pushSourceEvents(items, sourceDescriptor, sourceId, output, errors, stats) {
  if (!Array.isArray(items)) {
    errors.push(`${sourceDescriptor.label}: expected an array of activity items.`);
    return;
  }

  stats.total.itemsSeen += items.length;
  stats.bySource[sourceId].itemsSeen += items.length;

  for (const item of items) {
    const timestampMs = extractTimestampMs(item);
    if (timestampMs != null) {
      output.push({
        sourceId: sourceDescriptor.id,
        family: sourceDescriptor.family,
        timestampMs
      });
      stats.total.validTimestamps += 1;
      stats.bySource[sourceId].validTimestamps += 1;
    } else {
      stats.total.skippedItems += 1;
      stats.bySource[sourceId].skippedItems += 1;
    }
  }
}

export async function parseActivityEvents(discovery) {
  const events = [];
  const errors = [];
  const stats = {
    total: createEmptySourceStats(),
    bySource: {}
  };

  for (const descriptor of ACTIVITY_SOURCE_DESCRIPTORS) {
    stats.bySource[descriptor.id] = createEmptySourceStats();
  }

  for (const source of discovery.sourceMatches || []) {
    const descriptor = ACTIVITY_SOURCE_DESCRIPTORS.find((item) => item.id === source.id);
    if (!descriptor) {
      continue;
    }
    for (const file of source.files) {
      try {
        const payload = await parseJsonFile(file);
        const items = descriptor.parsePayload(payload);
        stats.total.filesParsed += 1;
        stats.bySource[source.id].filesParsed += 1;
        pushSourceEvents(items, descriptor, source.id, events, errors, stats);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  return {
    events,
    errors,
    stats
  };
}

export function getAvailableTimezones() {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return ["UTC"];
}

function getDatePartsInTimezone(timestampMs, timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(new Date(timestampMs));
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    weekdayLabel: map.weekday,
    hour: Number(map.hour)
  };
}

export function buildHeatmapData(events, timezone, options = {}) {
  const enabledSourceIds = options.enabledSourceIds || [];
  const enabledSet = enabledSourceIds.length > 0 ? new Set(enabledSourceIds) : null;
  const filteredEvents = (events || []).filter(
    (eventItem) => !enabledSet || enabledSet.has(eventItem.sourceId)
  );

  const weekdayHourCounts = Array.from({ length: 7 }, () => Array(24).fill(0));
  const weekdayHourDetails = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ familyCounts: {}, sourceCounts: {} }))
  );
  const calendarDayMap = new Map();
  const totalsByFamily = {};
  const totalsBySource = {};

  let minTimestamp = null;
  let maxTimestamp = null;

  for (const eventItem of filteredEvents) {
    const { timestampMs, family, sourceId } = eventItem;
    const parts = getDatePartsInTimezone(timestampMs, timezone);
    const weekdayIndex = WEEKDAY_ORDER.indexOf(parts.weekdayLabel);
    if (weekdayIndex >= 0 && parts.hour >= 0 && parts.hour <= 23) {
      weekdayHourCounts[weekdayIndex][parts.hour] += 1;
      const weekdayCell = weekdayHourDetails[weekdayIndex][parts.hour];
      weekdayCell.familyCounts[family] = (weekdayCell.familyCounts[family] || 0) + 1;
      weekdayCell.sourceCounts[sourceId] = (weekdayCell.sourceCounts[sourceId] || 0) + 1;
    }

    const currentDay = calendarDayMap.get(parts.dateKey) || {
      count: 0,
      familyCounts: {},
      sourceCounts: {}
    };
    currentDay.count += 1;
    currentDay.familyCounts[family] = (currentDay.familyCounts[family] || 0) + 1;
    currentDay.sourceCounts[sourceId] = (currentDay.sourceCounts[sourceId] || 0) + 1;
    calendarDayMap.set(parts.dateKey, currentDay);

    totalsByFamily[family] = (totalsByFamily[family] || 0) + 1;
    totalsBySource[sourceId] = (totalsBySource[sourceId] || 0) + 1;

    minTimestamp = minTimestamp == null ? timestampMs : Math.min(minTimestamp, timestampMs);
    maxTimestamp = maxTimestamp == null ? timestampMs : Math.max(maxTimestamp, timestampMs);
  }

  const calendarDays = Array.from(calendarDayMap.entries())
    .map(([dateKey, value]) => ({
      dateKey,
      ...value,
      dominantFamily: getDominantKey(value.familyCounts),
      dominantSourceId: getDominantKey(value.sourceCounts)
    }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  let activeWeekdayIndex = -1;
  let activeWeekdayTotal = 0;
  let activeHour = -1;
  let activeHourTotal = 0;

  for (let day = 0; day < 7; day += 1) {
    const dayTotal = weekdayHourCounts[day].reduce((sum, value) => sum + value, 0);
    if (dayTotal > activeWeekdayTotal) {
      activeWeekdayTotal = dayTotal;
      activeWeekdayIndex = day;
    }

    for (let hour = 0; hour < 24; hour += 1) {
      const hourTotal = weekdayHourCounts[day][hour];
      if (hourTotal > activeHourTotal) {
        activeHourTotal = hourTotal;
        activeHour = hour;
      }
    }
  }

  const rangeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  return {
    timezone,
    totalActivities: filteredEvents.length,
    totalsByFamily,
    totalsBySource,
    weekdayHourCounts,
    weekdayHourDetails: weekdayHourDetails.map((row) =>
      row.map((cell) => ({
        ...cell,
        dominantFamily: getDominantKey(cell.familyCounts),
        dominantSourceId: getDominantKey(cell.sourceCounts)
      }))
    ),
    calendarDays,
    weekdayLabels: WEEKDAY_ORDER,
    activeWeekdayLabel: activeWeekdayIndex >= 0 ? WEEKDAY_ORDER[activeWeekdayIndex] : "-",
    activeHourLabel: activeHour >= 0 ? `${String(activeHour).padStart(2, "0")}:00` : "-",
    dateRangeLabel:
      minTimestamp != null && maxTimestamp != null
        ? `${rangeFormatter.format(new Date(minTimestamp))} - ${rangeFormatter.format(
            new Date(maxTimestamp)
          )}`
        : "-"
  };
}

export function heatColor(count, maxCount) {
  if (!count || maxCount <= 0) {
    return "#eef2ff";
  }

  const ratio = Math.min(1, count / maxCount);
  if (ratio < 0.2) return "#c7d2fe";
  if (ratio < 0.4) return "#a5b4fc";
  if (ratio < 0.6) return "#818cf8";
  if (ratio < 0.8) return "#6366f1";
  return "#4338ca";
}

function getDominantKey(countMap) {
  return Object.entries(countMap || {}).reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ["", 0]
  )[0];
}

function toRgb(hexColor) {
  const safeHex = hexColor.replace("#", "");
  const value = Number.parseInt(safeHex, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

export function activityCellColor({ count, maxCount, mode = "intensity", dominantFamily }) {
  if (mode !== "breakdown") {
    return heatColor(count, maxCount);
  }

  if (!count || maxCount <= 0) {
    return "#f1f5f9";
  }

  const baseColor = FAMILY_COLORS[dominantFamily] || "#475569";
  const rgb = toRgb(baseColor);
  const ratio = Math.max(0.15, Math.min(1, count / maxCount));
  const alpha = 0.2 + ratio * 0.7;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
}

export function getActivityFamilyLegend() {
  return Object.entries(FAMILY_COLORS).map(([family, color]) => ({ family, color }));
}

/*
 Add future activity types by appending to ACTIVITY_SOURCE_DESCRIPTORS:
 - include unique id/family/label/folder
 - match file names in that folder
 - map raw payload shape to an array via parsePayload
*/
