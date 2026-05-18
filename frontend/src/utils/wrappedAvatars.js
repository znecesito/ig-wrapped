/**
 * Initials avatars for Wrapped leaderboards.
 * Future: pass `imageUrl` on each row and render <img> with onError → initials fallback.
 */

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Stable accent background for a username or thread key.
 * @param {string} key
 */
export function avatarColorForKey(key) {
  const hue = hashString(String(key || "?")) % 360;
  return `hsl(${hue} 52% 42%)`;
}

/**
 * @param {{ username?: string, label?: string }} row
 * @param {{ threadLabels?: boolean }} [opts]
 */
export function initialsForWrappedRow(row, { threadLabels = false } = {}) {
  if (threadLabels) {
    const label = String(row?.label || "").trim();
    if (label.startsWith("@")) {
      const bare = label.slice(1).replace(/[^\w.].*$/, "");
      if (bare) {
        return bare.slice(0, 1).toUpperCase();
      }
    }
    const first = label.split(/[,\s]+/).find((p) => p.length > 0);
    return (first?.[0] || "?").toUpperCase();
  }
  const u = String(row?.username || "").replace(/^@/, "").trim();
  return (u[0] || "?").toUpperCase();
}

/**
 * @param {{ username?: string, label?: string }} row
 * @param {{ threadLabels?: boolean }} [opts]
 */
export function avatarKeyForWrappedRow(row, { threadLabels = false } = {}) {
  if (threadLabels) {
    return String(row?.threadKey ?? row?.label ?? "thread");
  }
  return String(row?.username || "").replace(/^@/, "").toLowerCase();
}
