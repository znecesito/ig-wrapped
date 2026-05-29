import { formatActivityBreakdownForWrapped } from "./wrappedData.js";

/** Club-style personas keyed by activity family (Spotify “Clubs” analogue). */
export const FEED_PERSONALITIES = {
  likes: {
    title: "Heart Collector",
    tagline: "Double-taps are your love language.",
    emoji: "❤️"
  },
  comments: {
    title: "Comment Section Regular",
    tagline: "You show up in the thread, not just the feed.",
    emoji: "💬"
  },
  media: {
    title: "Poster",
    tagline: "Your grid and your stories carry the energy.",
    emoji: "📸"
  },
  storyInteractions: {
    title: "Story Reactor",
    tagline: "Polls, replies, and taps — you stay in the moment.",
    emoji: "✨"
  }
};

const FAMILY_LABELS = {
  likes: "likes",
  comments: "comments",
  media: "posts & media",
  storyInteractions: "story interactions"
};

function parseHour(activeHourLabel) {
  if (!activeHourLabel || activeHourLabel === "-") {
    return null;
  }
  const match = /^(\d{2}):00$/.exec(activeHourLabel);
  return match ? Number(match[1]) : null;
}

function maxConsecutiveActiveDays(calendarDays) {
  if (!calendarDays?.length) {
    return 0;
  }
  const sorted = [...calendarDays].filter((d) => d.count > 0).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  if (sorted.length === 0) {
    return 0;
  }

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1].dateKey}T12:00:00Z`);
    const curr = new Date(`${sorted[i].dateKey}T12:00:00Z`);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function busiestCalendarDay(calendarDays) {
  if (!calendarDays?.length) {
    return null;
  }
  let top = calendarDays[0];
  for (const day of calendarDays) {
    if (day.count > top.count) {
      top = day;
    }
  }
  return top.count > 0 ? top : null;
}

function formatExportYear(maxTimestampMs) {
  if (maxTimestampMs == null) {
    return null;
  }
  return new Date(maxTimestampMs).getFullYear();
}

function timeOfDayLabel(hour) {
  if (hour == null) {
    return null;
  }
  if (hour >= 21 || hour <= 4) {
    return "Night Owl";
  }
  if (hour >= 5 && hour <= 11) {
    return "Early Bird";
  }
  if (hour >= 12 && hour <= 16) {
    return "Afternoon Scroller";
  }
  return "Evening Regular";
}

/**
 * Leaderboard share lines (honest, export-scoped — no global percentile).
 * @param {{ username?: string, count?: number }[]} rows
 * @param {string} unit
 */
function shareLinesFromTopCounts(name, topCount, secondCount, unit, totalAll) {
  if (!name || topCount == null || topCount <= 0) {
    return { headline: null, subline: null };
  }
  if (!secondCount || secondCount <= 0) {
    return {
      headline: `${name} is your #1`,
      subline: `${formatCount(topCount)} ${unit} in this export`
    };
  }
  const ratio = topCount / secondCount;
  if (ratio >= 1.5) {
    return {
      headline: `${name} ran away with it`,
      subline: `${ratio.toFixed(1)}× more ${unit} than #2 in this export`
    };
  }
  const pct = totalAll > 0 ? Math.round((topCount / totalAll) * 100) : 0;
  return {
    headline:
      pct >= 40 ? `${pct}% of your ${unit} went to ${name}` : `${name} leads your ${unit}`,
    subline: `${formatCount(topCount)} ${unit} · #2 has ${formatCount(secondCount)}`
  };
}

/** Display name for DM thread share lines (1:1 → @handle, groups keep label). */
export function formatThreadShareName(label) {
  if (!label || typeof label !== "string") {
    return "this chat";
  }
  const t = label.trim();
  if (!t) {
    return "this chat";
  }
  if (t.includes(",") || /\s+and\s+/i.test(t)) {
    return t;
  }
  const bare = t.startsWith("@") ? t.slice(1) : t;
  if (/^[\w.]+$/.test(bare)) {
    return `@${bare}`;
  }
  return t;
}

export function topPersonShareLines(rows, unit) {
  if (!rows?.length) {
    return { headline: null, subline: null };
  }
  const top = rows[0];
  const handle = `@${String(top.username ?? "").replace(/^@/, "")}`;
  const second = rows[1];
  const total = rows.reduce((s, r) => s + (r.count ?? 0), 0);
  return shareLinesFromTopCounts(handle, top.count ?? 0, second?.count ?? 0, unit, total);
}

/**
 * DM thread share lines (export-scoped).
 * @param {{ label?: string, messageCount?: number }[]} rows
 */
export function topThreadShareLines(rows) {
  if (!rows?.length) {
    return { headline: null, subline: null };
  }
  const top = rows[0];
  const name = formatThreadShareName(top.label);
  const second = rows[1];
  const topCount = top.messageCount ?? 0;
  const total = rows.reduce((s, r) => s + (r.messageCount ?? 0), 0);
  return shareLinesFromTopCounts(name, topCount, second?.messageCount ?? 0, "messages", total);
}

function formatCount(n) {
  return typeof n === "number" ? n.toLocaleString() : String(n);
}

/**
 * Spotify-style derived insights from Wrapped baseline (export-local only).
 * @param {object | null | undefined} baseline
 */
export function buildWrappedInsights(baseline) {
  if (!baseline) {
    return null;
  }

  const heatmap = baseline.heatmapData;
  const breakdown = formatActivityBreakdownForWrapped(heatmap);
  const total = heatmap?.totalActivities ?? 0;

  let dominantFamily = null;
  let dominantPct = 0;
  for (const row of breakdown.families) {
    if (row.total > 0 && row.total >= (dominantFamily?.total ?? 0)) {
      dominantFamily = row;
      dominantPct = total > 0 ? Math.round((row.total / total) * 100) : 0;
    }
  }

  const personalityKey = dominantFamily?.family ?? null;
  const personality =
    personalityKey && FEED_PERSONALITIES[personalityKey]
      ? {
          key: personalityKey,
          label: FAMILY_LABELS[personalityKey] ?? personalityKey,
          ...FEED_PERSONALITIES[personalityKey]
        }
      : null;

  const hour = parseHour(heatmap?.activeHourLabel);
  const timePersona = timeOfDayLabel(hour);
  const streakDays = maxConsecutiveActiveDays(heatmap?.calendarDays);
  const busiestDay = busiestCalendarDay(heatmap?.calendarDays);
  const exportYear = formatExportYear(heatmap?.calendarMaxTimestampMs);

  let busiestDayLabel = null;
  if (busiestDay?.dateKey) {
    const d = new Date(`${busiestDay.dateKey}T12:00:00Z`);
    busiestDayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const activityPunchline =
    dominantFamily && dominantPct >= 35
      ? `${dominantPct}% of your activity was ${FAMILY_LABELS[dominantFamily.family] ?? dominantFamily.label}`
      : total > 0
        ? `${formatCount(total)} moments in this export`
        : null;

  return {
    exportYear,
    totalActivities: total,
    dominantFamily,
    dominantPct,
    personality,
    timePersona,
    activeWeekday: heatmap?.activeWeekdayLabel ?? null,
    activeHour: heatmap?.activeHourLabel ?? null,
    streakDays,
    busiestDay,
    busiestDayLabel,
    busiestDayCount: busiestDay?.count ?? 0,
    activityPunchline,
    likesShare: topPersonShareLines(baseline.mostLikedCreators, "likes"),
    commentsShare: topPersonShareLines(baseline.mostCommentedCreators, "comments"),
    storiesShare: topPersonShareLines(baseline.mostStoryCreators, "story taps"),
    dmsShare: topThreadShareLines(baseline.topThreads),
    searchesShare: topPersonShareLines(baseline.profileSearches?.rows ?? [], "searches")
  };
}
