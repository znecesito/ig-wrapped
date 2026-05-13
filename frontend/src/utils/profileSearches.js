import { normalizeInstagramUsername } from "./socialInteractionGraph.js";

const RECENT_SEARCHES_SEGMENT = "logged_information/recent_searches";
const PROFILE_SEARCHES_FILE = "profile_searches.json";

/**
 * @param {FileList | File[] | null | undefined} fileList
 * @returns {File[]}
 */
export function discoverProfileSearchFiles(fileList) {
  const files = Array.from(fileList || []);
  return files.filter((f) => {
    const p = String(f.webkitRelativePath || "")
      .toLowerCase()
      .replace(/\\/g, "/");
    if (!p.includes(RECENT_SEARCHES_SEGMENT)) {
      return false;
    }
    return String(f.name || "").toLowerCase() === PROFILE_SEARCHES_FILE;
  });
}

/**
 * @param {File} file
 * @returns {Promise<unknown>}
 */
async function parseJsonFile(file) {
  const text = await file.text();
  return JSON.parse(text);
}

/**
 * @param {FileList | File[] | null | undefined} files
 * @param {{ selfUsername?: string | null, topN?: number }} [options]
 * @returns {Promise<{ rows: { username: string, count: number }[], fileFound: boolean, warnings: string[], totalSearchEvents: number }>}
 */
export async function parseProfileSearchStats(files, options = {}) {
  const topN = Number(options.topN) > 0 ? Number(options.topN) : 5;
  const selfRaw = options.selfUsername;
  const selfNorm =
    selfRaw != null && String(selfRaw).trim()
      ? normalizeInstagramUsername(String(selfRaw))
      : null;

  const warnings = [];
  const matches = discoverProfileSearchFiles(files);
  if (matches.length === 0) {
    return { rows: [], fileFound: false, warnings: [], totalSearchEvents: 0 };
  }
  if (matches.length > 1) {
    warnings.push("Multiple profile_searches.json files found; using the first match.");
  }

  const file = matches[0];
  let payload;
  try {
    payload = await parseJsonFile(file);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`Could not parse profile_searches.json: ${msg}`);
    return { rows: [], fileFound: true, warnings, totalSearchEvents: 0 };
  }

  const searchesUser = payload?.searches_user;
  if (!Array.isArray(searchesUser)) {
    warnings.push("profile_searches.json: expected searches_user array.");
    return { rows: [], fileFound: true, warnings, totalSearchEvents: 0 };
  }

  /** @type {Map<string, number>} */
  const counts = new Map();
  let totalSearchEvents = 0;

  for (const entry of searchesUser) {
    const title = entry?.title;
    if (typeof title !== "string" || !title.trim()) {
      continue;
    }
    const norm = normalizeInstagramUsername(title);
    if (!norm) {
      continue;
    }
    if (selfNorm && norm === selfNorm) {
      continue;
    }
    const list = entry?.string_list_data;
    if (!Array.isArray(list)) {
      continue;
    }
    const n = list.length;
    totalSearchEvents += n;
    counts.set(norm, (counts.get(norm) || 0) + n);
  }

  const entries = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]);
  });

  const rows = entries.slice(0, topN).map(([username, count]) => ({ username, count }));

  return { rows, fileFound: true, warnings, totalSearchEvents };
}
