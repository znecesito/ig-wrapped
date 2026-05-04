const ACTIVITY_ROOT_SEGMENT = "your_instagram_activity";

/** Standard export path suffix (case-insensitive match on webkitRelativePath). */
export const PERSONAL_INFORMATION_JSON_SUFFIX =
  "personal_information/personal_information/personal_information.json";

/** @typedef {{ id: string, categoryId: string, label: string, folder: string, matchFile: (name: string) => boolean, parsePayload: (payload: unknown) => unknown }} SocialInteractionDescriptor */

/** @type {SocialInteractionDescriptor[]} */
export const SOCIAL_INTERACTION_DESCRIPTORS = [
  {
    id: "comments.post",
    categoryId: "comments",
    label: "Post comments",
    folder: "comments",
    matchFile: (fileName) => /^post_comments_.*\.json$/i.test(fileName),
    parsePayload: (payload) => (Array.isArray(payload) ? payload : [])
  },
  {
    id: "comments.story",
    categoryId: "comments",
    label: "Reels comments",
    folder: "comments",
    matchFile: (fileName) => fileName.toLowerCase() === "hype.json",
    parsePayload: (payload) => {
      const raw =
        payload &&
        typeof payload === "object" &&
        "comments_story_comments" in payload
          ? /** @type {{ comments_story_comments?: unknown }} */ (payload).comments_story_comments
          : null;
      return Array.isArray(raw) ? raw : [];
    }
  }
];

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

/**
 * @param {unknown} item
 * @returns {string | null}
 */
export function extractMediaOwnerUsername(item) {
  if (!item || typeof item !== "object") {
    return null;
  }
  const map = /** @type {{ string_map_data?: Record<string, unknown> }} */ (item).string_map_data;
  if (!map || typeof map !== "object") {
    return null;
  }
  const mediaOwner = map["Media Owner"];
  if (!mediaOwner || typeof mediaOwner !== "object") {
    return null;
  }
  const value = /** @type {{ value?: unknown }} */ (mediaOwner).value;
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

/**
 * Normalizes Instagram usernames for comparison (trim, strip leading @, lowercase).
 * @param {string} value
 * @returns {string}
 */
export function normalizeInstagramUsername(value) {
  let s = String(value).trim();
  if (s.startsWith("@")) {
    s = s.slice(1);
  }
  return s.toLowerCase();
}

/**
 * Prefer manual entry when non-empty; otherwise use auto-detected username from export.
 * @param {string | null | undefined} detectedFromExport
 * @param {string} manualInput
 * @returns {string | null}
 */
export function getEffectiveSelfUsername(detectedFromExport, manualInput) {
  const manual = String(manualInput || "").trim();
  if (manual) {
    return manual;
  }
  const d = detectedFromExport != null ? String(detectedFromExport).trim() : "";
  return d || null;
}

async function parseJsonFile(file) {
  try {
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON in ${file?.name || "unknown file"}.`);
  }
}

/**
 * Normalizes `profile_user` to a single record for reading username.
 * Meta exports may use a plain object or an array of section objects.
 * @param {unknown} payload
 * @returns {{ string_map_data?: Record<string, { value?: unknown }> } | null}
 */
function coerceProfileUserRecord(payload) {
  if (!payload || typeof payload !== "object" || !("profile_user" in payload)) {
    return null;
  }
  const profileUser = /** @type {{ profile_user?: unknown }} */ (payload).profile_user;

  if (Array.isArray(profileUser)) {
    if (profileUser.length === 0) {
      return null;
    }
    const withUsernameKey = profileUser.find((item) => {
      if (!item || typeof item !== "object") return false;
      const smd = /** @type {{ string_map_data?: unknown }} */ (item).string_map_data;
      return (
        smd &&
        typeof smd === "object" &&
        smd !== null &&
        "Username" in smd
      );
    });
    if (withUsernameKey && typeof withUsernameKey === "object") {
      return /** @type {{ string_map_data?: Record<string, { value?: unknown }> }} */ (
        withUsernameKey
      );
    }
    const withStringMap = profileUser.find((item) => {
      if (!item || typeof item !== "object") return false;
      const smd = /** @type {{ string_map_data?: unknown }} */ (item).string_map_data;
      return smd && typeof smd === "object" && smd !== null;
    });
    if (withStringMap && typeof withStringMap === "object") {
      return /** @type {{ string_map_data?: Record<string, { value?: unknown }> }} */ (
        withStringMap
      );
    }
    const first = profileUser[0];
    if (first && typeof first === "object") {
      return /** @type {{ string_map_data?: Record<string, { value?: unknown }> }} */ (first);
    }
    return null;
  }

  if (profileUser && typeof profileUser === "object") {
    return /** @type {{ string_map_data?: Record<string, { value?: unknown }> }} */ (profileUser);
  }

  return null;
}

/**
 * Reads `profile_user.string_map_data.Username.value` from the standard personal_information JSON.
 * `profile_user` may be a single object or an array of section objects (same path shape).
 * @param {FileList | File[] | null | undefined} fileList
 * @returns {Promise<{ username: string | null, fileFound: boolean }>}
 */
export async function parsePersonalInformationUsername(fileList) {
  const files = Array.from(fileList || []);
  const suffix = PERSONAL_INFORMATION_JSON_SUFFIX.toLowerCase();
  const match = files.find((file) => {
    const rel = String(file.webkitRelativePath || "")
      .replace(/\\/g, "/")
      .toLowerCase();
    return rel.endsWith(suffix);
  });

  if (!match) {
    return { username: null, fileFound: false };
  }

  try {
    const payload = await parseJsonFile(match);
    const record = coerceProfileUserRecord(payload);
    const smd = record?.string_map_data;
    const usernameBlock =
      smd && typeof smd === "object"
        ? /** @type {Record<string, unknown>} */ (smd).Username ??
          /** @type {Record<string, unknown>} */ (smd).username
        : undefined;
    const raw =
      usernameBlock && typeof usernameBlock === "object" && "value" in usernameBlock
        ? /** @type {{ value?: unknown }} */ (usernameBlock).value
        : null;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed) {
        return { username: trimmed, fileFound: true };
      }
    }
    return { username: null, fileFound: true };
  } catch {
    return { username: null, fileFound: true };
  }
}

export function getSocialSources() {
  return SOCIAL_INTERACTION_DESCRIPTORS.map((d) => ({
    id: d.id,
    categoryId: d.categoryId,
    label: d.label
  }));
}

const CATEGORY_LABELS = {
  comments: "Comments"
};

/** Categories for chip rows: one Comments row toggling all comment sources. */
export function getSocialCategories() {
  const byCat = new Map();
  for (const d of SOCIAL_INTERACTION_DESCRIPTORS) {
    if (!byCat.has(d.categoryId)) {
      byCat.set(d.categoryId, {
        id: d.categoryId,
        label: CATEGORY_LABELS[d.categoryId] ?? d.categoryId,
        sourceIds: []
      });
    }
    byCat.get(d.categoryId).sourceIds.push(d.id);
  }
  return Array.from(byCat.values());
}

/**
 * Same discovery rules as the heatmap: only files under `your_instagram_activity/...`,
 * matched per descriptor folder + filename.
 * @param {FileList | File[] | null | undefined} fileList
 */
export function discoverSocialInteractionFiles(fileList) {
  const files = Array.from(fileList || []);
  const activityFiles = files.filter((file) => {
    const relativePath = String(file.webkitRelativePath || "").toLowerCase();
    return relativePath.includes(`${ACTIVITY_ROOT_SEGMENT}/`);
  });

  const sourceMatches = SOCIAL_INTERACTION_DESCRIPTORS.map((descriptor) => ({
    id: descriptor.id,
    categoryId: descriptor.categoryId,
    label: descriptor.label,
    folder: descriptor.folder,
    files: files.filter(
      (file) =>
        fileBelongsToActivityFolder(file, descriptor.folder) &&
        descriptor.matchFile(String(file.name || ""))
    )
  }));

  return {
    allFiles: files,
    activityFiles,
    sourceMatches,
    parseTargetFiles: sourceMatches.flatMap((s) => s.files),
    parseTargetPaths: sourceMatches.flatMap((s) =>
      s.files.map((f) => f.webkitRelativePath || f.name)
    )
  };
}

/**
 * @param {{ sourceMatches?: { id: string, files: File[] }[] }} discovery Result of `discoverSocialInteractionFiles`.
 * @param {{ selfUsername?: string | null }} [options] Excludes interactions where Media Owner is this account (comments on your own content).
 */
export async function parseSocialInteractionCounts(discovery, options = {}) {
  const selfRaw = options.selfUsername;
  const selfNorm =
    selfRaw != null && String(selfRaw).trim()
      ? normalizeInstagramUsername(String(selfRaw))
      : null;

  /** @type {Record<string, Record<string, number>>} */
  const countsBySource = {};
  for (const d of SOCIAL_INTERACTION_DESCRIPTORS) {
    countsBySource[d.id] = {};
  }

  const errors = [];
  let filesParsed = 0;
  let itemsSeen = 0;
  let countedInteractions = 0;
  let skippedMissingOwner = 0;
  let skippedSelfAccount = 0;

  for (const source of discovery.sourceMatches || []) {
    const descriptor = SOCIAL_INTERACTION_DESCRIPTORS.find((d) => d.id === source.id);
    if (!descriptor) {
      continue;
    }
    const bucket = countsBySource[descriptor.id];
    for (const file of source.files) {
      try {
        const payload = await parseJsonFile(file);
        const rawItems = descriptor.parsePayload(payload);
        const items = Array.isArray(rawItems) ? rawItems : [];
        filesParsed += 1;
        itemsSeen += items.length;

        for (const item of items) {
          const username = extractMediaOwnerUsername(item);
          if (!username) {
            skippedMissingOwner += 1;
            continue;
          }
          if (selfNorm && normalizeInstagramUsername(username) === selfNorm) {
            skippedSelfAccount += 1;
            continue;
          }
          bucket[username] = (bucket[username] || 0) + 1;
          countedInteractions += 1;
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }
  }

  return {
    countsBySource,
    errors,
    stats: {
      filesParsed,
      itemsSeen,
      countedInteractions,
      skippedMissingOwner,
      skippedSelfAccount
    }
  };
}

/**
 * @param {Record<string, Record<string, number>>} countsBySource
 * @param {string[]} enabledSourceIds
 * @param {number} [limit]
 * @returns {{ username: string, count: number }[]}
 */
export function buildTopInteractions(countsBySource, enabledSourceIds, limit = 5) {
  /** @type {Map<string, number>} */
  const merged = new Map();
  for (const id of enabledSourceIds) {
    const bucket = countsBySource[id];
    if (!bucket) {
      continue;
    }
    for (const [username, count] of Object.entries(bucket)) {
      merged.set(username, (merged.get(username) || 0) + count);
    }
  }

  const entries = [...merged.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]);
  });

  return entries.slice(0, limit).map(([username, count]) => ({ username, count }));
}
