function parseJsonBuffer(fileBuffer, fileLabel) {
  try {
    const raw = fileBuffer.toString("utf-8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${fileLabel} file.`);
  }
}

function pickUsername(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  if (typeof entry.username === "string" && entry.username.trim()) {
    return entry.username.trim();
  }

  if (typeof entry.value === "string" && entry.value.trim()) {
    return entry.value.trim();
  }

  if (Array.isArray(entry?.string_list_data)) {
    for (const row of entry.string_list_data) {
      if (typeof row?.value === "string" && row.value.trim()) {
        return row.value.trim();
      }

      // Fallback for exports that only include profile URL.
      if (typeof row?.href === "string" && row.href.includes("instagram.com/")) {
        const normalized = row.href.replace(/\/+$/, "");
        const username = normalized.split("/").pop();
        if (username) {
          return username.trim();
        }
      }
    }
  }

  return null;
}

function isDirectUserEntry(item) {
  return Boolean(
    item &&
      typeof item === "object" &&
      (typeof item.username === "string" ||
        typeof item.value === "string" ||
        Array.isArray(item.string_list_data))
  );
}

function extractEntries(payload, nestedKey, label) {
  if (Array.isArray(payload)) {
    if (payload.every(isDirectUserEntry)) {
      return payload;
    }

    const nested = payload.flatMap((item) =>
      Array.isArray(item?.[nestedKey]) ? item[nestedKey] : []
    );
    if (nested.length > 0) {
      return nested;
    }
  }

  if (Array.isArray(payload?.[nestedKey])) {
    return payload[nestedKey];
  }

  throw new Error(
    `Unexpected ${label} format. Expected an array or ${nestedKey} array.`
  );
}

export function extractFollowers(fileBuffer) {
  const payload = parseJsonBuffer(fileBuffer, "followers");
  const followersArray = extractEntries(
    payload,
    "relationships_followers",
    "followers"
  );

  const usernames = [];
  for (const item of followersArray) {
    const username = pickUsername(item);
    if (username) {
      usernames.push(username);
    }
  }

  return usernames;
}

export function extractFollowing(fileBuffer) {
  const payload = parseJsonBuffer(fileBuffer, "following");
  const followingArray = extractEntries(
    payload,
    "relationships_following",
    "following"
  );

  const usernames = [];
  for (const item of followingArray) {
    const username = pickUsername(item);
    if (username) {
      usernames.push(username);
    }
  }

  return usernames;
}
