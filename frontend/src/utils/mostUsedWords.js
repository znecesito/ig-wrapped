const ACTIVITY_ROOT_SEGMENT = "your_instagram_activity";

/** @typedef {{ word: string, count: number }} TopWordRow */
/** @typedef {{ tag: string, display: string, count: number }} TopHashtagRow */
/** @typedef {{
 *   filesParsed: number,
 *   captionsParsed: number,
 *   tokensCounted: number,
 *   tokensFiltered: number,
 *   uniqueWords: number,
 *   uniqueHashtags: number
 * }} MostUsedWordsStats */

/** @type {readonly string[]} */
const ENGLISH_STOPWORD_LIST = [
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "just",
  "let's",
  "like",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "really",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves"
];

/**
 * Curated English stopwords (lowercase). Extend via `buildStopwordSet` / options.
 * @type {ReadonlySet<string>}
 */
export const ENGLISH_STOPWORDS = new Set(ENGLISH_STOPWORD_LIST.map((w) => w.toLowerCase()));

/**
 * @param {Iterable<string>} [extra]
 * @returns {Set<string>}
 */
export function buildStopwordSet(extra) {
  const set = new Set(ENGLISH_STOPWORDS);
  if (extra) {
    for (const w of extra) {
      if (typeof w === "string" && w.trim()) {
        set.add(w.trim().toLowerCase());
      }
    }
  }
  return set;
}

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
 * @param {string} fileName
 * @returns {"posts" | "archived" | "reels" | "stories" | null}
 */
export function classifyMediaCaptionFile(fileName) {
  const n = String(fileName || "").toLowerCase();
  if (n === "archived_posts.json") {
    return "archived";
  }
  if (n === "reels.json") {
    return "reels";
  }
  if (n === "stories.json") {
    return "stories";
  }
  if (/^posts_\d+\.json$/i.test(fileName)) {
    return "posts";
  }
  return null;
}

/**
 * @param {File[]} files
 * @returns {{ activityFiles: File[], parseTargetFiles: File[] }}
 */
export function discoverMostUsedWordsMediaFiles(files) {
  const fileArray = Array.from(files || []);
  const activityFiles = fileArray.filter((f) =>
    String(f.webkitRelativePath || "")
      .toLowerCase()
      .includes(`${ACTIVITY_ROOT_SEGMENT}/`)
  );
  const parseTargetFiles = fileArray.filter((f) => {
    if (!fileBelongsToActivityFolder(f, "media")) {
      return false;
    }
    return classifyMediaCaptionFile(f.name) != null;
  });
  return { activityFiles, parseTargetFiles };
}

function coerceCollection(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return Object.values(value);
  }
  return null;
}

function looksSuspiciousForUtf8Repair(text) {
  if (/â€™|â€œ|â€"|â€˜|â€¦/.test(text)) {
    return true;
  }
  if (/Ã./.test(text)) {
    return true;
  }
  if (/ð|ð/.test(text)) {
    return true;
  }
  if (/[\u00c2\u00e2][\u0080-\u00bf]/.test(text)) {
    return true;
  }
  if (/[\u0080-\u009f]{2,}/.test(text)) {
    return true;
  }
  return false;
}

function mojibakeSuspicionScore(s) {
  let score = 0;
  if (/â/.test(s)) {
    score += 2;
  }
  if (/Ã./.test(s)) {
    score += 1;
  }
  if (/[\u0080-\u009f]{2,}/.test(s)) {
    score += 2;
  }
  if (/\uFFFD/.test(s)) {
    score += 3;
  }
  if (/ð/.test(s)) {
    score += 1;
  }
  return score;
}

function tryUtf8RepairFromLatin1ByteView(s) {
  try {
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c > 255) {
        return null;
      }
      bytes[i] = c;
    }
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Guarded repair: only when suspicious; fall back if repair looks worse.
 * @param {string} text
 * @returns {string}
 */
export function repairMojibakeIfNeeded(text) {
  if (typeof text !== "string" || text.length === 0) {
    return "";
  }
  if (!looksSuspiciousForUtf8Repair(text)) {
    return text;
  }
  const repaired = tryUtf8RepairFromLatin1ByteView(text);
  if (repaired == null) {
    return text;
  }
  const before = mojibakeSuspicionScore(text);
  const after = mojibakeSuspicionScore(repaired);
  const replacementBefore = (text.match(/\uFFFD/g) || []).length;
  const replacementAfter = (repaired.match(/\uFFFD/g) || []).length;
  if (after > before + 1) {
    return text;
  }
  if (replacementAfter > replacementBefore) {
    return text;
  }
  if (repaired.length === 0) {
    return text;
  }
  return repaired;
}

function stripUrls(s) {
  return s.replace(/https?:\/\/[^\s]+/gi, " ");
}

const HASHTAG_RE = /#([\p{L}\p{M}\p{N}_]+)/gu;
const WORD_RE = /[\p{L}\p{M}]+(?:[''\u2019-][\p{L}\p{M}]+)*/gu;

function normalizeForStopwordLookup(token) {
  return token.replace(/\u2019/g, "'");
}

/**
 * @param {string} caption
 * @param {{ minWordLength: number, stopwords: Set<string> }} opts
 * @returns {{
 *   hashtags: Map<string, number>,
 *   wordCounts: Map<string, number>,
 *   tokensCounted: number,
 *   tokensFiltered: number
 * }}
 */
export function tokenizeCaption(caption, opts) {
  const { minWordLength, stopwords } = opts;
  const repaired = repairMojibakeIfNeeded(String(caption || ""));
  const lower = repaired.toLowerCase();

  const hashtags = new Map();
  let tokensCounted = 0;
  let tokensFiltered = 0;

  let withoutTags = lower;
  const tagMatches = [...lower.matchAll(HASHTAG_RE)];
  for (const m of tagMatches) {
    const key = m[1];
    if (!key) {
      continue;
    }
    hashtags.set(key, (hashtags.get(key) || 0) + 1);
    tokensCounted += 1;
  }
  withoutTags = withoutTags.replace(HASHTAG_RE, " ");

  const noUrls = stripUrls(withoutTags);
  const words = noUrls.match(WORD_RE) || [];

  const wordCounts = new Map();
  for (const w of words) {
    tokensCounted += 1;
    const lw = w.toLowerCase();
    if (lw.length < minWordLength) {
      tokensFiltered += 1;
      continue;
    }
    const forStop = normalizeForStopwordLookup(lw);
    if (stopwords.has(forStop)) {
      tokensFiltered += 1;
      continue;
    }
    wordCounts.set(forStop, (wordCounts.get(forStop) || 0) + 1);
  }

  return { hashtags, wordCounts, tokensCounted, tokensFiltered };
}

function mergeCountMaps(into, from) {
  for (const [k, v] of from) {
    into.set(k, (into.get(k) || 0) + v);
  }
}

function extractTitleFromMediaItem(m) {
  if (!m || typeof m !== "object") {
    return "";
  }
  const t = m.title;
  return typeof t === "string" ? t.trim() : "";
}

function captionFromPostLikeEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return "";
  }
  const top = typeof entry.title === "string" ? entry.title.trim() : "";
  if (top) {
    return top;
  }
  const media = Array.isArray(entry.media) ? entry.media : [];
  for (const m of media) {
    const mt = extractTitleFromMediaItem(m);
    if (mt) {
      return mt;
    }
  }
  return "";
}

function captionsFromReelsEntry(entry) {
  const media = entry && typeof entry === "object" && Array.isArray(entry.media) ? entry.media : [];
  const parts = [];
  for (const m of media) {
    const t = extractTitleFromMediaItem(m);
    if (t) {
      parts.push(t);
    }
  }
  return parts.length ? parts.join(" ") : "";
}

/**
 * @param {unknown} payload
 * @param {"posts" | "archived" | "reels" | "stories"} kind
 * @returns {string[]}
 */
export function extractCaptionsFromMediaPayload(payload, kind) {
  const out = [];
  if (kind === "posts") {
    const rows = Array.isArray(payload) ? payload : coerceCollection(payload) || [];
    for (const row of rows) {
      const c = captionFromPostLikeEntry(row);
      if (c) {
        out.push(c);
      }
    }
    return out;
  }
  if (kind === "archived") {
    const rows = coerceCollection(/** @type {{ ig_archived_post_media?: unknown }} */ (payload)?.ig_archived_post_media) || [];
    for (const row of rows) {
      const c = captionFromPostLikeEntry(row);
      if (c) {
        out.push(c);
      }
    }
    return out;
  }
  if (kind === "reels") {
    const rows = coerceCollection(/** @type {{ ig_reels_media?: unknown }} */ (payload)?.ig_reels_media) || [];
    for (const row of rows) {
      const c = captionsFromReelsEntry(row);
      if (c) {
        out.push(c);
      }
    }
    return out;
  }
  if (kind === "stories") {
    const rows = coerceCollection(/** @type {{ ig_stories?: unknown }} */ (payload)?.ig_stories) || [];
    for (const row of rows) {
      if (row && typeof row === "object") {
        const t = typeof row.title === "string" ? row.title.trim() : "";
        if (t) {
          out.push(t);
        }
      }
    }
    return out;
  }
  return out;
}

function mapToTopList(map, topN, kind) {
  const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const slice = arr.slice(0, topN);
  if (kind === "hashtag") {
    return slice.map(([tag, count]) => ({
      tag,
      display: `#${tag}`,
      count
    }));
  }
  return slice.map(([word, count]) => ({ word, count }));
}

/**
 * @param {File[]} parseTargetFiles
 * @returns {Promise<{ captions: string[], warnings: string[], filesParsed: number }>}
 */
async function loadCaptionsFromFiles(parseTargetFiles) {
  const captions = [];
  const warnings = [];
  let filesParsed = 0;

  for (const file of parseTargetFiles) {
    const kind = classifyMediaCaptionFile(file.name);
    if (!kind) {
      continue;
    }
    let text;
    try {
      text = await file.text();
    } catch (e) {
      warnings.push(`Could not read ${file.webkitRelativePath || file.name}: ${String(e)}`);
      continue;
    }
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      warnings.push(`Invalid JSON in ${file.webkitRelativePath || file.name}: ${String(e)}`);
      continue;
    }
    filesParsed += 1;
    try {
      const caps = extractCaptionsFromMediaPayload(payload, kind);
      captions.push(...caps);
    } catch (e) {
      warnings.push(`Caption extraction failed for ${file.webkitRelativePath || file.name}: ${String(e)}`);
    }
  }

  return { captions, warnings, filesParsed };
}

/**
 * @typedef {{
 *   topN?: number,
 *   minWordLength?: number,
 *   customStopwords?: Iterable<string>,
 *   customStopwordSet?: Set<string>
 * }} MostUsedWordsOptions
 */

/**
 * @param {File[]} files Browser File list from folder picker
 * @param {MostUsedWordsOptions} [options]
 * @returns {Promise<{
 *   topWords: TopWordRow[],
 *   topHashtags: TopHashtagRow[],
 *   stats: MostUsedWordsStats,
 *   warnings: string[]
 * }>}
 */
export async function analyzeMostUsedWordsFromFiles(files, options = {}) {
  const topN = options.topN ?? 5;
  const minWordLength = options.minWordLength ?? 2;
  const stopwords =
    options.customStopwordSet instanceof Set
      ? options.customStopwordSet
      : buildStopwordSet(options.customStopwords);

  const discovery = discoverMostUsedWordsMediaFiles(files);
  const warnings = [...(discovery.activityFiles.length === 0 ? ["No files under your_instagram_activity were found."] : [])];

  if (discovery.parseTargetFiles.length === 0) {
    return {
      topWords: [],
      topHashtags: [],
      stats: {
        filesParsed: 0,
        captionsParsed: 0,
        tokensCounted: 0,
        tokensFiltered: 0,
        uniqueWords: 0,
        uniqueHashtags: 0
      },
      warnings
    };
  }

  const { captions, warnings: loadWarnings, filesParsed } = await loadCaptionsFromFiles(
    discovery.parseTargetFiles
  );
  warnings.push(...loadWarnings);

  const wordTotals = new Map();
  const hashtagTotals = new Map();
  let tokensCounted = 0;
  let tokensFiltered = 0;

  for (const cap of captions) {
    const { hashtags, wordCounts, tokensCounted: tc, tokensFiltered: tf } = tokenizeCaption(cap, {
      minWordLength,
      stopwords
    });
    tokensCounted += tc;
    tokensFiltered += tf;
    mergeCountMaps(hashtagTotals, hashtags);
    mergeCountMaps(wordTotals, wordCounts);
  }

  return {
    topWords: /** @type {TopWordRow[]} */ (mapToTopList(wordTotals, topN, "word")),
    topHashtags: /** @type {TopHashtagRow[]} */ (mapToTopList(hashtagTotals, topN, "hashtag")),
    stats: {
      filesParsed,
      captionsParsed: captions.length,
      tokensCounted,
      tokensFiltered,
      uniqueWords: wordTotals.size,
      uniqueHashtags: hashtagTotals.size
    },
    warnings
  };
}
