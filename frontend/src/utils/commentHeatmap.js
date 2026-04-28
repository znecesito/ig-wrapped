const COMMENTS_FOLDER_SEGMENTS = ["your_instagram_activity", "comments"];

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

export function discoverCommentFiles(fileList) {
  const files = Array.from(fileList || []);
  const inCommentsFolder = files.filter((file) => {
    const relativePath = String(file.webkitRelativePath || "").toLowerCase();
    const normalizedPath = relativePath.replace(/\\/g, "/");
    const pathParts = normalizedPath.split("/");

    const activityIndex = pathParts.indexOf(COMMENTS_FOLDER_SEGMENTS[0]);
    if (activityIndex < 0) {
      return false;
    }

    return pathParts[activityIndex + 1] === COMMENTS_FOLDER_SEGMENTS[1];
  });

  const hypeFile = inCommentsFolder.find((file) =>
    (file.name || "").toLowerCase() === "hype.json"
  );
  const postCommentFiles = inCommentsFolder.filter((file) =>
    /^post_comments_.*\.json$/i.test(file.name || "")
  );

  return {
    allFiles: files,
    commentFiles: inCommentsFolder,
    commentFilePaths: inCommentsFolder.map((file) => file.webkitRelativePath || file.name),
    hypeFile,
    postCommentFiles,
    parseTargetFiles: [hypeFile, ...postCommentFiles].filter(Boolean)
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

function extractCommentTimestampMs(comment) {
  if (!comment || typeof comment !== "object") {
    return null;
  }

  const directCandidates = [
    comment.timestamp,
    comment.time,
    comment.date,
    comment.created_at,
    comment.created_time
  ];

  for (const candidate of directCandidates) {
    const normalized = extractTimestampFromValue(candidate);
    if (normalized != null) {
      return normalized;
    }
  }

  return extractTimestampFromValue(comment.string_map_data);
}

function pushCommentTimestamps(comments, source, output, errors, stats) {
  if (!Array.isArray(comments)) {
    errors.push(`${source}: expected an array of comments.`);
    return;
  }

  stats.commentsSeen += comments.length;

  for (const comment of comments) {
    const timestampMs = extractCommentTimestampMs(comment);
    if (timestampMs != null) {
      output.push(timestampMs);
      stats.validTimestamps += 1;
    } else {
      stats.skippedComments += 1;
    }
  }
}

export async function parseCommentTimestamps(discovery) {
  const timestampsMs = [];
  const errors = [];
  const stats = {
    filesParsed: 0,
    commentsSeen: 0,
    validTimestamps: 0,
    skippedComments: 0
  };

  if (discovery.hypeFile) {
    try {
      const payload = await parseJsonFile(discovery.hypeFile);
      const storyComments = payload?.comments_story_comments;
      stats.filesParsed += 1;
      pushCommentTimestamps(storyComments, "hype.json", timestampsMs, errors, stats);
    } catch (error) {
      errors.push(error.message);
    }
  }

  for (const file of discovery.postCommentFiles) {
    try {
      const payload = await parseJsonFile(file);
      stats.filesParsed += 1;
      pushCommentTimestamps(payload, file.name, timestampsMs, errors, stats);
    } catch (error) {
      errors.push(error.message);
    }
  }

  return {
    timestampsMs,
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

const WEEKDAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildHeatmapData(timestampsMs, timezone) {
  const weekdayHourCounts = Array.from({ length: 7 }, () => Array(24).fill(0));
  const calendarDayMap = new Map();

  let minTimestamp = null;
  let maxTimestamp = null;

  for (const timestampMs of timestampsMs) {
    const parts = getDatePartsInTimezone(timestampMs, timezone);
    const weekdayIndex = WEEKDAY_ORDER.indexOf(parts.weekdayLabel);
    if (weekdayIndex >= 0 && parts.hour >= 0 && parts.hour <= 23) {
      weekdayHourCounts[weekdayIndex][parts.hour] += 1;
    }

    calendarDayMap.set(parts.dateKey, (calendarDayMap.get(parts.dateKey) || 0) + 1);

    minTimestamp = minTimestamp == null ? timestampMs : Math.min(minTimestamp, timestampMs);
    maxTimestamp = maxTimestamp == null ? timestampMs : Math.max(maxTimestamp, timestampMs);
  }

  const calendarDays = Array.from(calendarDayMap.entries())
    .map(([dateKey, count]) => ({ dateKey, count }))
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
    totalComments: timestampsMs.length,
    weekdayHourCounts,
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
