import { normalizeInstagramUsername } from "./socialInteractionGraph.js";

const ACTIVITY_ROOT = "your_instagram_activity";
const INBOX_SEGMENT = `${ACTIVITY_ROOT}/messages/inbox/`;
const MESSAGE_FILE_RE = /^message_\d+\.json$/i;

/** Instagram default group titles: names joined by " and ". */
const TITLE_AND_JOINED_RE = /\s+and\s+/i;

export const MESSAGE_FREQUENCY_TOP_N = 15;

/**
 * @param {string} relPath
 */
function normalizeRelPath(relPath) {
  return String(relPath || "").replace(/\\/g, "/").toLowerCase();
}

/**
 * @param {File} file
 */
function isInboxMessageJsonFile(file) {
  const rel = normalizeRelPath(file.webkitRelativePath);
  if (!rel.includes(INBOX_SEGMENT)) {
    return false;
  }
  return MESSAGE_FILE_RE.test(String(file.name || ""));
}

/**
 * @param {string} dirKey
 */
function folderBasenameFromThreadKey(dirKey) {
  const parts = dirKey.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : dirKey;
}

/**
 * Latin script + combining marks + numbers + limited punctuation (not global \\p{L}).
 * @param {unknown} raw
 * @returns {string}
 */
function sanitizeDisplayName(raw) {
  if (raw == null) {
    return "";
  }
  let s = String(raw).normalize("NFKC");
  s = s.replace(/[^\p{Script=Latin}\p{M}\p{N}\s.'\-]/gu, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
function sanitizeInstagramHandle(raw) {
  if (raw == null || typeof raw !== "string") {
    return "";
  }
  const s = raw.replace(/^@+/, "").trim();
  return s.replace(/[^a-zA-Z0-9._]/g, "");
}

/**
 * @param {unknown} p
 * @returns {string | null}
 */
function getRawUsername(p) {
  if (typeof p === "string") {
    return p;
  }
  if (!p || typeof p !== "object") {
    return null;
  }
  const u = /** @type {{ username?: unknown }} */ (p).username;
  return typeof u === "string" ? u : null;
}

/**
 * Display names from name/handle (sanitized); fallback to username handle only.
 * @param {unknown} p
 * @returns {string | null}
 */
function participantLabelForDisplay(p) {
  if (typeof p === "string") {
    const disp = sanitizeDisplayName(p);
    if (disp) {
      return disp;
    }
    const h = sanitizeInstagramHandle(p);
    return h || null;
  }
  if (!p || typeof p !== "object") {
    return null;
  }
  const o = /** @type {Record<string, unknown>} */ (p);
  for (const key of ["name", "handle"]) {
    const v = o[key];
    if (typeof v === "string") {
      const d = sanitizeDisplayName(v);
      if (d) {
        return d;
      }
    }
  }
  const u = o.username;
  if (typeof u === "string") {
    const h = sanitizeInstagramHandle(u);
    if (h) {
      return h;
    }
  }
  return null;
}

/**
 * @param {unknown} p
 * @param {string | null} selfNorm
 */
function participantMatchesSelf(p, selfNorm) {
  if (!selfNorm) {
    return false;
  }
  const u = getRawUsername(p);
  if (u && normalizeInstagramUsername(u) === selfNorm) {
    return true;
  }
  const label = participantLabelForDisplay(p);
  return Boolean(label && normalizeInstagramUsername(label) === selfNorm);
}

/**
 * @param {unknown} senderName
 * @param {unknown[] | null} participants
 * @param {string | null} selfNorm
 */
function senderMatchesSelf(senderName, participants, selfNorm) {
  if (senderName == null || !selfNorm) {
    return false;
  }
  const senderDisplay = sanitizeDisplayName(String(senderName));
  const senderHandle = sanitizeInstagramHandle(String(senderName));

  if (Array.isArray(participants)) {
    for (const p of participants) {
      if (!participantMatchesSelf(p, selfNorm)) {
        continue;
      }
      const selfLabel = participantLabelForDisplay(p);
      if (selfLabel && senderDisplay && selfLabel.toLowerCase() === senderDisplay.toLowerCase()) {
        return true;
      }
      const selfHandle = getRawUsername(p);
      if (
        selfHandle &&
        senderHandle &&
        normalizeInstagramUsername(selfHandle) === normalizeInstagramUsername(senderHandle)
      ) {
        return true;
      }
    }
  }

  if (senderHandle && normalizeInstagramUsername(senderHandle) === selfNorm) {
    return true;
  }
  if (senderDisplay && normalizeInstagramUsername(senderDisplay) === selfNorm) {
    return true;
  }
  return false;
}

/**
 * Folder names for named groups use the segment before the first "_"; the rest is IDs / hashes.
 * @param {string} folderBasename
 */
function namedGroupPrefixFromFolder(folderBasename) {
  const base = String(folderBasename || "");
  const i = base.indexOf("_");
  if (i <= 0) {
    return "";
  }
  return sanitizeDisplayName(base.slice(0, i));
}

/**
 * Thread folder segment before Insta suffix `_…` (IDs / hashes).
 * @param {string} segment
 */
function inboxFolderStem(segment) {
  const s = String(segment || "");
  const us = s.indexOf("_");
  return us >= 0 ? s.slice(0, us) : s;
}

/**
 * First path segment after `.../inbox/`, then stem before `_` (export thread_path).
 * @param {string} threadPath
 */
function labelStemFromThreadPathExport(threadPath) {
  const normalized = String(threadPath).replace(/\\/g, "/");
  const lower = normalized.toLowerCase();
  const marker = "/inbox/";
  const idx = lower.indexOf(marker);
  if (idx < 0) {
    return "";
  }
  const after = normalized.slice(idx + marker.length);
  const slash = after.indexOf("/");
  const segment = slash >= 0 ? after.slice(0, slash) : after;
  if (!segment) {
    return "";
  }
  const stem = inboxFolderStem(segment);
  return sanitizeInstagramHandle(stem) || sanitizeDisplayName(stem) || stem.trim() || "";
}

/**
 * When thread_path is missing, same stem logic from the on-disk folder name.
 * @param {string} folderBasename
 */
function labelStemFromFolderBasename(folderBasename) {
  const stem = inboxFolderStem(folderBasename);
  if (!stem) {
    return "";
  }
  return sanitizeInstagramHandle(stem) || sanitizeDisplayName(stem) || stem.trim() || "";
}

/**
 * Prefer export thread_path; fall back to inbox folder basename.
 * @param {string | null | undefined} threadPath
 * @param {string} folderBasename
 */
function pathLikeLabelForIndividual(threadPath, folderBasename) {
  const trimmed = typeof threadPath === "string" ? threadPath.trim() : "";
  if (trimmed) {
    const fromExport = labelStemFromThreadPathExport(trimmed);
    if (fromExport) {
      return fromExport;
    }
  }
  return labelStemFromFolderBasename(folderBasename);
}

/**
 * `participants[n].name` contains characters our Latin sanitizer would strip (non Latin/M/N/etc.).
 * @param {unknown} p
 */
function participantNameHasWeirdCharacters(p) {
  if (!p || typeof p !== "object") {
    return false;
  }
  const n = /** @type {{ name?: unknown }} */ (p).name;
  if (typeof n !== "string" || !n.trim()) {
    return false;
  }
  return /[^\p{Script=Latin}\p{M}\p{N}\s.'\-]/gu.test(n.normalize("NFKC"));
}

/**
 * Non-group threads: if display name field is garbled, use inbox folder stem from thread_path.
 * @param {unknown} p
 * @param {string | null | undefined} threadPath
 * @param {string} folderBasename
 */
function individualParticipantLabel(p, threadPath, folderBasename) {
  if (participantNameHasWeirdCharacters(p)) {
    const fallback = pathLikeLabelForIndividual(threadPath, folderBasename);
    if (fallback) {
      return fallback;
    }
  }
  return participantLabelForDisplay(p);
}

/**
 * @param {unknown[]} participants
 * @param {string | null} selfNorm
 */
function collectGroupParticipantNames(participants, selfNorm) {
  /** @type {string[]} */
  const names = [];
  for (const p of participants) {
    if (participantMatchesSelf(p, selfNorm)) {
      continue;
    }
    const d = participantLabelForDisplay(p);
    if (d) {
      names.push(d);
    }
  }
  return names;
}

/**
 * @param {string[]} names
 */
function formatUnnamedGroupLabel(names) {
  if (names.length === 0) {
    return "Group";
  }
  if (names.length <= 3) {
    return `${names.join(", ")} group`;
  }
  const head = names.slice(0, 3).join(", ");
  const rest = names.length - 3;
  return `${head} + ${rest} group`;
}

/**
 * @param {string | null | undefined} threadTitle
 */
function isAndJoinedGroupTitle(threadTitle) {
  return typeof threadTitle === "string" && TITLE_AND_JOINED_RE.test(threadTitle);
}

/**
 * @param {unknown[]} participants
 * @param {string | null} selfNorm
 * @param {string} folderBasename
 * @param {string | null} threadTitle
 * @param {string | null} threadPath
 */
function buildThreadLabel(participants, selfNorm, folderBasename, threadTitle, threadPath) {
  if (!Array.isArray(participants) || participants.length === 0) {
    return sanitizeDisplayName(folderBasename) || "Thread";
  }

  const n = participants.length;

  if (n <= 2) {
    if (n === 2) {
      if (selfNorm) {
        for (const p of participants) {
          if (participantMatchesSelf(p, selfNorm)) {
            continue;
          }
          const label = individualParticipantLabel(p, threadPath, folderBasename);
          if (label) {
            return label;
          }
        }
      }
      const a = individualParticipantLabel(participants[0], threadPath, folderBasename);
      const b = individualParticipantLabel(participants[1], threadPath, folderBasename);
      const pair = [...new Set([a, b].filter(Boolean))].sort((x, y) => x.localeCompare(y));
      if (pair.length === 2) {
        return pair.join(", ");
      }
      if (pair.length === 1) {
        return pair[0];
      }
      return (
        pathLikeLabelForIndividual(threadPath, folderBasename) ||
        sanitizeDisplayName(folderBasename) ||
        "Thread"
      );
    }

    const one = individualParticipantLabel(participants[0], threadPath, folderBasename);
    return (
      one ||
      pathLikeLabelForIndividual(threadPath, folderBasename) ||
      sanitizeDisplayName(folderBasename) ||
      "Thread"
    );
  }

  if (typeof threadTitle === "string" && threadTitle.trim()) {
    const rawTitle = threadTitle.trim();
    if (isAndJoinedGroupTitle(rawTitle)) {
      const names = collectGroupParticipantNames(participants, selfNorm);
      return formatUnnamedGroupLabel(names);
    }
    const sanitizedTitle = sanitizeDisplayName(rawTitle);
    if (sanitizedTitle) {
      return sanitizedTitle;
    }
    const names = collectGroupParticipantNames(participants, selfNorm);
    return formatUnnamedGroupLabel(names);
  }

  const names = collectGroupParticipantNames(participants, selfNorm);
  if (names.length > 0) {
    return formatUnnamedGroupLabel(names);
  }
  const namedPrefix = namedGroupPrefixFromFolder(folderBasename);
  if (namedPrefix.length > 0) {
    return namedPrefix;
  }
  return sanitizeDisplayName(folderBasename) || "Group";
}

/**
 * @param {FileList | File[] | null | undefined} fileList
 */
export function discoverMessageThreads(fileList) {
  const files = Array.from(fileList || []);
  const activityFiles = files.filter((file) => {
    const rel = normalizeRelPath(file.webkitRelativePath);
    return rel.includes(`${ACTIVITY_ROOT}/`);
  });

  const inboxMessageFiles = files.filter(isInboxMessageJsonFile);

  /** @type {Map<string, File[]>} */
  const threadBuckets = new Map();
  for (const file of inboxMessageFiles) {
    const rel = String(file.webkitRelativePath || "").replace(/\\/g, "/");
    const slash = rel.lastIndexOf("/");
    const dirKey = slash >= 0 ? rel.slice(0, slash).toLowerCase() : "";
    if (!threadBuckets.has(dirKey)) {
      threadBuckets.set(dirKey, []);
    }
    threadBuckets.get(dirKey).push(file);
  }

  for (const arr of threadBuckets.values()) {
    arr.sort((a, b) =>
      String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: "base" })
    );
  }

  return {
    allFiles: files,
    activityFiles,
    inboxMessageFiles,
    threadBuckets
  };
}

/**
 * @param {Map<string, File[]>} threadBuckets
 * @param {{ selfUsername?: string | null }} [options]
 * @returns {Promise<{
 *   rows: {
 *     threadKey: string,
 *     label: string,
 *     messageCount: number,
 *     selfMessageCount: number,
 *     otherMessageCount: number,
 *     isGroup: boolean,
 *     warnings: string[]
 *   }[],
 *   warnings: string[],
 *   stats: {
 *     threadsConsidered: number,
 *     threadsWithMessages: number,
 *     filesParsed: number,
 *     filesSkipped: number,
 *     totalMessages: number
 *   }
 * }>}
 */
export async function parseAndAggregateThreads(threadBuckets, options = {}) {
  const selfRaw = options.selfUsername;
  const selfNorm =
    selfRaw != null && String(selfRaw).trim()
      ? normalizeInstagramUsername(String(selfRaw))
      : null;

  /** @type {string[]} */
  const globalWarnings = [];
  let filesParsed = 0;
  let filesSkipped = 0;
  let threadsConsidered = 0;
  let threadsWithMessages = 0;
  let totalMessages = 0;

  /** @type { { threadKey: string, label: string, messageCount: number, selfMessageCount: number, otherMessageCount: number, isGroup: boolean, warnings: string[] }[] } */
  const rows = [];

  for (const [threadKey, threadFiles] of threadBuckets) {
    threadsConsidered += 1;
    let messageCount = 0;
    let selfMessageCount = 0;
    let otherMessageCount = 0;
    /** @type {unknown[] | null} */
    let participants = null;
    /** @type {string | null} */
    let threadTitle = null;
    /** @type {string | null} */
    let threadPath = null;
    /** @type {string[]} */
    const rowWarnings = [];
    const folderBasename = folderBasenameFromThreadKey(threadKey);

    for (const file of threadFiles) {
      const pathLabel = file.webkitRelativePath || file.name || "unknown";
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        if (!Array.isArray(payload?.messages)) {
          rowWarnings.push(`Skipped ${pathLabel}: missing or non-array messages.`);
          filesSkipped += 1;
          continue;
        }
        messageCount += payload.messages.length;
        filesParsed += 1;
        if (!participants && Array.isArray(payload.participants) && payload.participants.length > 0) {
          participants = payload.participants;
        }
        for (const msg of payload.messages) {
          if (!msg || typeof msg !== "object") {
            continue;
          }
          const sender = /** @type {{ sender_name?: unknown }} */ (msg).sender_name;
          if (senderMatchesSelf(sender, participants, selfNorm)) {
            selfMessageCount += 1;
          } else {
            otherMessageCount += 1;
          }
        }
        if (threadTitle == null && typeof payload.title === "string" && payload.title.trim()) {
          threadTitle = payload.title.trim();
        }
        if (threadPath == null && typeof payload.thread_path === "string" && payload.thread_path.trim()) {
          threadPath = payload.thread_path.trim();
        }
      } catch {
        rowWarnings.push(`Invalid JSON in ${pathLabel}.`);
        filesSkipped += 1;
      }
    }

    if (messageCount === 0) {
      for (const w of rowWarnings) {
        globalWarnings.push(`Thread (${folderBasename}): ${w}`);
      }
      continue;
    }

    threadsWithMessages += 1;
    totalMessages += messageCount;
    globalWarnings.push(...rowWarnings);
    const label = buildThreadLabel(participants || [], selfNorm, folderBasename, threadTitle, threadPath);
    const isGroup = Array.isArray(participants) && participants.length > 2;

    rows.push({
      threadKey: threadKey,
      label,
      messageCount,
      selfMessageCount,
      otherMessageCount,
      isGroup,
      warnings: rowWarnings
    });
  }

  rows.sort((a, b) => {
    if (b.messageCount !== a.messageCount) {
      return b.messageCount - a.messageCount;
    }
    return a.label.localeCompare(b.label);
  });

  return {
    rows,
    warnings: globalWarnings,
    stats: {
      threadsConsidered,
      threadsWithMessages,
      filesParsed,
      filesSkipped,
      totalMessages
    }
  };
}

/**
 * Recompute display labels for already-parsed rows (counts unchanged).
 * @param { { threadKey: string, label: string, messageCount: number, warnings: string[] }[]} rows
 * @param {Map<string, File[]>} threadBuckets
 * @param {{ selfUsername?: string | null }} options
 */
export async function relabelMessageThreadRows(rows, threadBuckets, options = {}) {
  const selfRaw = options.selfUsername;
  const selfNorm =
    selfRaw != null && String(selfRaw).trim()
      ? normalizeInstagramUsername(String(selfRaw))
      : null;

  const updated = [];
  for (const row of rows) {
    const threadFiles = threadBuckets.get(row.threadKey);
    if (!threadFiles?.length) {
      updated.push(row);
      continue;
    }

    /** @type {unknown[] | null} */
    let participants = null;
    /** @type {string | null} */
    let threadTitle = null;
    /** @type {string | null} */
    let threadPath = null;
    for (const file of threadFiles) {
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        if (
          !participants &&
          Array.isArray(payload?.participants) &&
          payload.participants.length > 0
        ) {
          participants = payload.participants;
        }
        if (threadTitle == null && typeof payload.title === "string" && payload.title.trim()) {
          threadTitle = payload.title.trim();
        }
        if (threadPath == null && typeof payload.thread_path === "string" && payload.thread_path.trim()) {
          threadPath = payload.thread_path.trim();
        }
      } catch {
        /* keep scanning */
      }
    }

    const folderBasename = folderBasenameFromThreadKey(row.threadKey);
    const label = buildThreadLabel(participants || [], selfNorm, folderBasename, threadTitle, threadPath);
    updated.push({ ...row, label });
  }

  updated.sort((a, b) => {
    if (b.messageCount !== a.messageCount) {
      return b.messageCount - a.messageCount;
    }
    return a.label.localeCompare(b.label);
  });

  return updated;
}
