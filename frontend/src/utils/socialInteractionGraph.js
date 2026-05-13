const ACTIVITY_ROOT_SEGMENT = "your_instagram_activity";

/** Standard export path suffix (case-insensitive match on webkitRelativePath). */
export const PERSONAL_INFORMATION_JSON_SUFFIX =
  "personal_information/personal_information/personal_information.json";

/**
 * @typedef {{
 *   id: string,
 *   categoryId: string,
 *   label: string,
 *   folder: string,
 *   matchFile: (name: string) => boolean,
 *   parsePayload: (payload: unknown) => unknown,
 *   extractTargetUsername: (item: unknown) => string | null
 * }} SocialInteractionDescriptor
 */

/**
 * Matches [`commentHeatmap.js`](commentHeatmap.js) `coerceCollection` so payload shapes align.
 * @param {unknown} value
 * @returns {unknown[] | null}
 */
export function coerceCollection(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return Object.values(value);
  }
  return null;
}

/** @type {SocialInteractionDescriptor[]} */
export const SOCIAL_INTERACTION_DESCRIPTORS = [
  {
    id: "comments.post",
    categoryId: "comments",
    label: "Post comments",
    folder: "comments",
    matchFile: (fileName) => /^post_comments_.*\.json$/i.test(fileName),
    parsePayload: (payload) => (Array.isArray(payload) ? payload : []),
    extractTargetUsername: extractMediaOwnerUsername
  },
  {
    id: "comments.story",
    categoryId: "comments",
    label: "Story comments",
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
    },
    extractTargetUsername: extractMediaOwnerUsername
  },
  {
    id: "comments.reels",
    categoryId: "comments",
    label: "Reels comments",
    folder: "comments",
    matchFile: (fileName) => fileName.toLowerCase() === "reels_comments.json",
    parsePayload: (payload) => coerceCollection(payload?.comments_reels_comments),
    extractTargetUsername: extractMediaOwnerUsername
  },
  {
    id: "likes.post",
    categoryId: "likes",
    label: "Liked posts",
    folder: "likes",
    matchFile: (fileName) => fileName.toLowerCase() === "liked_posts.json",
    parsePayload: (payload) => coerceCollection(payload?.likes_media_likes ?? payload),
    extractTargetUsername: extractLikedPostOwnerUsername
  },
  {
    id: "likes.comment",
    categoryId: "likes",
    label: "Liked comments",
    folder: "likes",
    matchFile: (fileName) => fileName.toLowerCase() === "liked_comments.json",
    parsePayload: (payload) => coerceCollection(payload?.likes_comment_likes),
    extractTargetUsername: extractLikedCommentUsername
  },
  {
    id: "storyInteractions.polls",
    categoryId: "storyInteractions",
    label: "Story polls",
    folder: "story_interactions",
    matchFile: (fileName) => fileName.toLowerCase() === "polls.json",
    parsePayload: (payload) => coerceCollection(payload?.story_activities_polls),
    extractTargetUsername: extractStoryInteractionTargetUsername
  },
  {
    id: "storyInteractions.stories_viewed",
    categoryId: "storyInteractions",
    label: "Stories viewed",
    folder: "story_interactions",
    matchFile: (fileName) => {
      const n = fileName.toLowerCase();
      return n === "stories_viewed.json" || n === "stories_view.json";
    },
    parsePayload: (payload) => (Array.isArray(payload) ? payload : null),
    extractTargetUsername: extractStoryInteractionTargetUsername
  },
  {
    id: "storyInteractions.story_likes",
    categoryId: "storyInteractions",
    label: "Story likes",
    folder: "story_interactions",
    matchFile: (fileName) => fileName.toLowerCase() === "story_likes.json",
    parsePayload: (payload) => (Array.isArray(payload) ? payload : null),
    extractTargetUsername: extractStoryInteractionTargetUsername
  },
  {
    id: "storyInteractions.questions",
    categoryId: "storyInteractions",
    label: "Story questions",
    folder: "story_interactions",
    matchFile: (fileName) => fileName.toLowerCase() === "questions.json",
    parsePayload: (payload) => coerceCollection(payload?.story_activities_questions),
    extractTargetUsername: extractStoryInteractionTargetUsername
  },
  {
    id: "storyInteractions.quizzes",
    categoryId: "storyInteractions",
    label: "Story quizzes",
    folder: "story_interactions",
    matchFile: (fileName) => fileName.toLowerCase() === "quizzes.json",
    parsePayload: (payload) => coerceCollection(payload?.story_activities_quizzes),
    extractTargetUsername: extractStoryInteractionTargetUsername
  },
  {
    id: "storyInteractions.reaction_sticker_reactions",
    categoryId: "storyInteractions",
    label: "Story sticker reactions",
    folder: "story_interactions",
    matchFile: (fileName) =>
      fileName.toLowerCase() === "story_reaction_sticker_reactions.json",
    parsePayload: (payload) =>
      coerceCollection(payload?.story_activities_reaction_sticker_reactions),
    extractTargetUsername: extractStoryInteractionTargetUsername
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

const MAX_LABEL_WALK_DEPTH = 40;

/**
 * @param {unknown} node
 * @param {number} [depth]
 * @returns {string | null}
 */
function findUsernameLabelPairRecursive(node, depth = 0) {
  if (depth > MAX_LABEL_WALK_DEPTH || node == null) {
    return null;
  }
  if (Array.isArray(node)) {
    for (const el of node) {
      const found = findUsernameLabelPairRecursive(el, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }
  if (typeof node !== "object") {
    return null;
  }
  const o = /** @type {Record<string, unknown>} */ (node);
  const lbl = o.label;
  const val = o.value;
  if (
    typeof lbl === "string" &&
    lbl.trim().toLowerCase() === "username" &&
    typeof val === "string"
  ) {
    const t = val.trim();
    if (t) {
      return t;
    }
  }
  for (const v of Object.values(o)) {
    const found = findUsernameLabelPairRecursive(v, depth + 1);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * @param {unknown} node
 * @param {number} [depth]
 * @returns {string | null}
 */
function findUsernameUnderOwnerBlock(node, depth = 0) {
  if (depth > MAX_LABEL_WALK_DEPTH || !node || typeof node !== "object") {
    return null;
  }
  const lv = /** @type {{ label_values?: unknown[] }} */ (node).label_values;
  if (!Array.isArray(lv)) {
    return null;
  }
  const ownerBlock = lv.find(
    (b) =>
      b &&
      typeof b === "object" &&
      String(/** @type {{ title?: unknown }} */ (b).title ?? "")
        .trim()
        .toLowerCase() === "owner"
  );
  if (!ownerBlock || typeof ownerBlock !== "object") {
    return null;
  }
  return findUsernameLabelPairRecursive(ownerBlock, depth + 1);
}

/**
 * @param {unknown} item
 * @returns {string | null}
 */
function extractLikedPostOwnerUsername(item) {
  if (!item || typeof item !== "object") {
    return null;
  }
  const underOwner = findUsernameUnderOwnerBlock(item);
  if (underOwner) {
    return underOwner;
  }
  return findUsernameLabelPairRecursive(item);
}

/**
 * @param {unknown} item
 * @returns {string | null}
 */
function extractLikedCommentUsername(item) {
  if (!item || typeof item !== "object") {
    return null;
  }
  const t = /** @type {{ title?: unknown }} */ (item).title;
  if (typeof t !== "string") {
    return null;
  }
  const trimmed = t.trim();
  return trimmed || null;
}

/**
 * @param {unknown} item
 * @returns {string | null}
 */
function extractStoryInteractionTargetUsername(item) {
  if (!item || typeof item !== "object") {
    return null;
  }
  const map = /** @type {{ string_map_data?: Record<string, unknown> }} */ (item).string_map_data;
  if (map && typeof map === "object") {
    for (const key of ["Media Owner", "Title", "Username"]) {
      const block = map[key];
      if (block && typeof block === "object") {
        const value = /** @type {{ value?: unknown }} */ (block).value;
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed) {
            return trimmed;
          }
        }
      }
    }
  }
  const fromLabelValues = extractLikedPostOwnerUsername(item);
  if (fromLabelValues) {
    return fromLabelValues;
  }
  const title = /** @type {{ title?: unknown }} */ (item).title;
  if (typeof title === "string") {
    const trimmed = title.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return extractMediaOwnerUsername(item);
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
  comments: "Comments",
  likes: "Likes",
  storyInteractions: "Story interactions"
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
          const username = descriptor.extractTargetUsername(item);
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

/**
 * Top accounts per social category (comments / likes / story interactions), merging all source ids in each category.
 *
 * @param {Record<string, Record<string, number>>} countsBySource
 * @param {number} [limitPerCategory]
 * @returns {{ categoryId: string, categoryLabel: string, rows: { username: string, count: number }[], maxCount: number }[]}
 */
export function buildTopAccountsByCategory(countsBySource, limitPerCategory = 5) {
  const lim = Number(limitPerCategory) > 0 ? Number(limitPerCategory) : 5;
  const categories = getSocialCategories();
  const out = [];
  for (const cat of categories) {
    const merged = new Map();
    for (const sourceId of cat.sourceIds) {
      const bucket = countsBySource[sourceId];
      if (!bucket) {
        continue;
      }
      for (const [username, count] of Object.entries(bucket)) {
        merged.set(username, (merged.get(username) || 0) + count);
      }
    }
    const rows = [...merged.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, lim)
      .map(([username, count]) => ({ username, count }));
    const maxCount = rows.length > 0 ? Math.max(...rows.map((r) => r.count)) : 0;
    out.push({
      categoryId: cat.id,
      categoryLabel: cat.label,
      rows,
      maxCount
    });
  }
  return out;
}
