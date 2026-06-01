const MONTHS = 12;
export const PEOPLE_RANK_TOP_N = 5;

function monthKeyFromMs(timestampMs, timeZone = "UTC") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit"
  }).formatToParts(new Date(timestampMs));
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

function monthLabelFromKey(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short" });
}

function buildMonthKeys(endMs, timeZone) {
  const end = new Date(endMs);
  const keys = [];
  for (let i = MONTHS - 1; i >= 0; i -= 1) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    keys.push(monthKeyFromMs(d.getTime(), timeZone));
  }
  return keys;
}

function rankTopUsers(cumulativeByUser, limit = PEOPLE_RANK_TOP_N) {
  return [...cumulativeByUser.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([username], index) => ({ username, rank: index + 1 }));
}

/**
 * Monthly rank history for social accounts (last 12 months of export).
 * Tracks everyone who ever lands in the top 5 so lines/labels can enter and exit.
 */
export function buildPeopleRankHistory(events, topCreators, { timeZone = "UTC" } = {}) {
  const withTs = (events ?? []).filter(
    (e) => e?.username && typeof e.timestampMs === "number" && Number.isFinite(e.timestampMs)
  );

  const creatorMeta = new Map(
    (topCreators ?? []).map((row) => [
      row.username,
      {
        dominantType: row.dominantType ?? "likes",
        count: row.count ?? 0
      }
    ])
  );

  const finalTop = (topCreators ?? []).slice(0, PEOPLE_RANK_TOP_N);
  if (!finalTop.length) {
    return null;
  }

  let endMs = Date.now();
  if (withTs.length) {
    endMs = Math.max(...withTs.map((e) => e.timestampMs));
  }

  const monthKeys = buildMonthKeys(endMs, timeZone);
  const monthLabels = monthKeys.map(monthLabelFromKey);

  /** @type {Map<string, number>[]} */
  const cumulativeByMonth = monthKeys.map(() => new Map());

  if (withTs.length) {
    const sorted = [...withTs].sort((a, b) => a.timestampMs - b.timestampMs);
    let eventIdx = 0;
    const running = new Map();

    for (let mi = 0; mi < monthKeys.length; mi += 1) {
      const key = monthKeys[mi];
      while (eventIdx < sorted.length) {
        const ev = sorted[eventIdx];
        if (monthKeyFromMs(ev.timestampMs, timeZone) > key) {
          break;
        }
        running.set(ev.username, (running.get(ev.username) ?? 0) + 1);
        eventIdx += 1;
      }
      cumulativeByMonth[mi] = new Map(running);
    }
  } else {
    const totalByUser = new Map(finalTop.map((r) => [r.username, r.count ?? 0]));
    for (let mi = 0; mi < monthKeys.length; mi += 1) {
      const frac = (mi + 1) / monthKeys.length;
      const partial = new Map();
      for (const [user, total] of totalByUser) {
        partial.set(user, Math.round(total * frac));
      }
      cumulativeByMonth[mi] = partial;
    }
  }

  const ranksByMonth = monthKeys.map((_, mi) => {
    const ranked = rankTopUsers(cumulativeByMonth[mi], PEOPLE_RANK_TOP_N);
    return new Map(ranked.map((r) => [r.username, r.rank]));
  });

  const everInTop = new Set();
  for (const rankMap of ranksByMonth) {
    for (const username of rankMap.keys()) {
      everInTop.add(username);
    }
  }
  for (const row of finalTop) {
    everInTop.add(row.username);
  }

  const trackUsernames = [...everInTop].sort((a, b) => {
    const aTotal = creatorMeta.get(a)?.count ?? 0;
    const bTotal = creatorMeta.get(b)?.count ?? 0;
    return bTotal - aTotal || a.localeCompare(b);
  });

  const OUT_RANK = PEOPLE_RANK_TOP_N + 1;

  const series = trackUsernames.map((username) => {
    const meta = creatorMeta.get(username) ?? { dominantType: "likes", count: 0 };
    const points = monthKeys.map((_, mi) => {
      const rank = ranksByMonth[mi].get(username) ?? OUT_RANK;
      return {
        monthIndex: mi,
        rank,
        inTop: rank <= PEOPLE_RANK_TOP_N
      };
    });
    return {
      username,
      dominantType: meta.dominantType,
      totalCount: meta.count,
      points
    };
  });

  return {
    monthLabels,
    monthKeys,
    topN: PEOPLE_RANK_TOP_N,
    topAccounts: finalTop.map((r) => ({
      username: r.username,
      count: r.count,
      dominantType: r.dominantType ?? "likes"
    })),
    series,
    hasTimestamps: withTs.length > 0
  };
}
