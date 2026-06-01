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

function formatCount(n) {
  return typeof n === "number" ? n.toLocaleString() : String(n);
}

function parseHour(activeHourLabel) {
  if (!activeHourLabel || activeHourLabel === "-") {
    return null;
  }
  const match = /^(\d{2}):00$/.exec(activeHourLabel);
  return match ? Number(match[1]) : null;
}

const WEEKDAY_FULL = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday"
};

/** "20:00" → "8pm" */
export function formatHour12(activeHourLabel) {
  const hour = parseHour(activeHourLabel);
  if (hour == null) {
    return activeHourLabel;
  }
  const h12 = hour % 12 || 12;
  const ampm = hour < 12 ? "am" : "pm";
  return `${h12}${ampm}`;
}

/** "Sat" → "Saturday" */
export function formatWeekdayFull(shortLabel) {
  if (!shortLabel || shortLabel === "-") {
    return shortLabel;
  }
  return WEEKDAY_FULL[shortLabel] ?? shortLabel;
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

const WEEKDAY_ARCHETYPES = {
  Sunday: "Sloth",
  Monday: "Camel",
  Tuesday: "Fox",
  Wednesday: "Owl",
  Thursday: "Raven",
  Friday: "Panther",
  Saturday: "Dolphin"
};

const TIME_ADJECTIVES = {
  night: ["Nocturnal", "Midnight", "Moonlit"],
  morning: ["Dawn", "Early-bird", "Sunrise"],
  afternoon: ["Daylight", "Solar", "Afternoon"],
  evening: ["Twilight", "Golden-hour", "Evening"]
};

function timeBucket(hour) {
  if (hour == null) {
    return "evening";
  }
  if (hour >= 21 || hour <= 4) {
    return "night";
  }
  if (hour >= 5 && hour <= 11) {
    return "morning";
  }
  if (hour >= 12 && hour <= 16) {
    return "afternoon";
  }
  return "evening";
}

function pickStableIndex(seed, mod) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % mod;
  }
  return hash;
}

/** Peak weekday + hour persona (export-scoped rhythm). */
export function buildRhythmPersona(activeWeekday, activeHourLabel) {
  if (!activeWeekday || activeWeekday === "-" || !activeHourLabel || activeHourLabel === "-") {
    return null;
  }

  const hour = parseHour(activeHourLabel);
  const bucket = timeBucket(hour);
  const adjectives = TIME_ADJECTIVES[bucket];
  const archetype = WEEKDAY_ARCHETYPES[activeWeekday] ?? "Regular";
  const adj = adjectives[pickStableIndex(`${activeWeekday}-${bucket}`, adjectives.length)];
  const title = `${adj} ${archetype}`;

  const displayWeekday = formatWeekdayFull(activeWeekday);
  const displayHour = formatHour12(activeHourLabel);
  const quip = `You show up hardest on ${displayWeekday}s around ${displayHour}. The feed learned your schedule.`;

  return {
    title,
    quip,
    activeWeekday,
    activeHour: activeHourLabel,
    displayWeekday,
    displayHour,
    deckLabel: `${displayWeekday} · ${displayHour}`
  };
}

export function buildActivityQuip(total) {
  if (!total || total < 1) {
    return "Even a quiet export still tells a story.";
  }
  if (total < 100) {
    return "You showed up when it counted. That's love for the game.";
  }
  if (total < 1000) {
    return "You were putting in numbers. That's just love for the game!";
  }
  if (total < 10000) {
    return "You were putting in work. That's love for the game.";
  }
  return "You were putting in numbers at scale. Absolute love for the game.";
}

export function buildStreakQuip(streakDays) {
  if (!streakDays || streakDays < 2) {
    return null;
  }
  if (streakDays >= 14) {
    return `${streakDays} days back-to-back — you're basically on payroll for this app.`;
  }
  if (streakDays >= 7) {
    return `A full week without ghosting your own feed. Respect.`;
  }
  if (streakDays >= 3) {
    return `${streakDays} days in a row — consistency looks good on you.`;
  }
  return `${streakDays} days straight. Baby streak, big energy.`;
}

export function buildBusiestDayQuip(busiestDayLabel, busiestDayCount) {
  if (!busiestDayLabel || !busiestDayCount) {
    return null;
  }
  if (busiestDayCount >= 100) {
    return `${busiestDayLabel} was unhinged — ${formatCount(busiestDayCount)} activities and zero chill.`;
  }
  if (busiestDayCount >= 30) {
    return `Everything happened at once on ${busiestDayLabel}. Chaos, but make it Instagram.`;
  }
  return `${busiestDayLabel} was your loudest day in this export. The timeline felt it.`;
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

function buildSpotlightQuip({ name, unit, thread, exportSharePct, topCount, ratioToSecond, dominantType }) {
  if (thread) {
    if (exportSharePct >= 40) {
      return `${name} caught ${exportSharePct}% of your messages here. The group chat knows.`;
    }
    if (ratioToSecond >= 1.5) {
      return `${name} ran your inbox this export. Reply-all energy.`;
    }
    return `${name} — your most active thread. Screenshots optional.`;
  }

  const quipUnit =
    dominantType === "stories"
      ? "story taps"
      : dominantType === "comments"
        ? "comments"
        : unit;

  if (quipUnit === "likes" || (dominantType === "likes" && unit === "interactions")) {
    if (exportSharePct >= 40) {
      return `${name} had your thumb on speed dial — ${exportSharePct}% of your likes.`;
    }
    return `${name} earned the most double-taps in this export. Rent's due.`;
  }

  if (quipUnit === "comments") {
    if (ratioToSecond >= 1.5) {
      return `${name} owned the comment box. Caps lock optional; sincerity wasn't.`;
    }
    return `${name} got the most replies from you. The thread remembers.`;
  }

  if (quipUnit === "story taps") {
    return `${name} was your story lane main character. The ring doesn't lie.`;
  }

  return `${name} topped your ${unit} in this export.`;
}

const DOMINANT_TYPE_LABELS = {
  likes: "Mostly likes",
  comments: "Mostly comments",
  stories: "Mostly story taps"
};

/**
 * Merged social spotlight (#1 across likes, comments, story interactions).
 * @param {{ username: string, count: number, dominantType?: string }[]} rows
 */
export function buildSocialSpotlight(rows) {
  const leaderboardRows = rows?.map((r) => ({ username: r.username, count: r.count })) ?? [];
  const share = topPersonShareLines(leaderboardRows, "interactions");
  if (!rows?.length) {
    return {
      ...share,
      empty: true,
      name: null,
      topCount: 0,
      exportSharePct: 0,
      fanLine: null,
      quip: null,
      topRow: null,
      dominantType: null,
      dominantLabel: null
    };
  }

  const top = rows[0];
  const topCount = top.count ?? 0;
  const total = rows.reduce((s, r) => s + (r.count ?? 0), 0);
  const exportSharePct = total > 0 ? Math.round((topCount / total) * 100) : 0;
  const name = `@${String(top.username ?? "").replace(/^@/, "")}`;
  const dominantType = top.dominantType ?? "likes";
  const dominantLabel = DOMINANT_TYPE_LABELS[dominantType] ?? "Mixed interactions";

  const secondCount = rows.length > 1 ? (rows[1].count ?? 0) : 0;
  const ratioToSecond = secondCount > 0 ? topCount / secondCount : 0;

  let fanLine;
  if (exportSharePct >= 40) {
    fanLine = `${dominantLabel} · ${exportSharePct}% of your interactions here`;
  } else if (rows.length > 1 && ratioToSecond >= 1.5) {
    fanLine = `${dominantLabel} · ${ratioToSecond.toFixed(1)}× more than #2`;
  } else if (rows.length > 1) {
    fanLine = `${dominantLabel} · ${formatCount(topCount)} interactions · #2 has ${formatCount(secondCount)}`;
  } else {
    fanLine = `${dominantLabel} · ${formatCount(topCount)} interactions in this export`;
  }

  const quip = buildSpotlightQuip({
    name,
    unit: "interactions",
    dominantType,
    exportSharePct,
    topCount,
    ratioToSecond
  });

  return {
    ...share,
    empty: false,
    name,
    topCount,
    unit: "interactions",
    exportSharePct,
    fanLine,
    quip,
    topRow: top,
    dominantType,
    dominantLabel
  };
}

/**
 * You vs them balance in the top DM thread (export-scoped).
 * @param {{ label?: string, messageCount?: number, selfMessageCount?: number, otherMessageCount?: number, isGroup?: boolean } | null | undefined} topThread
 */
export function buildDmBalanceSpotlight(topThread) {
  if (!topThread?.messageCount) {
    return {
      empty: true,
      name: null,
      selfPct: 0,
      otherPct: 0,
      messageCount: 0,
      isGroup: false,
      quip: null,
      fanLine: null,
      topRow: null
    };
  }

  const name = formatThreadShareName(topThread.label);
  const selfCount = topThread.selfMessageCount ?? 0;
  const otherCount = topThread.otherMessageCount ?? 0;
  const tracked = selfCount + otherCount;
  const messageCount = topThread.messageCount ?? 0;
  const selfPct = tracked > 0 ? Math.round((selfCount / tracked) * 100) : 0;
  const otherPct = tracked > 0 ? 100 - selfPct : 0;
  const isGroup = Boolean(topThread.isGroup);

  let quip;
  if (tracked === 0) {
    quip = isGroup
      ? `${name} is your busiest thread — sender breakdown wasn't available.`
      : `${name} is your busiest thread in this export.`;
  } else if (isGroup) {
    if (selfPct >= 60) {
      quip = `You carry ${name}. The group chat feels it.`;
    } else if (selfPct <= 30) {
      quip = `Mostly listening in ${name}. Rare double-text energy.`;
    } else {
      quip = `Balanced contributor in ${name}. You show up, then step back.`;
    }
  } else if (selfPct >= 70) {
    quip = `You set the pace with ${name}. They'll catch up.`;
  } else if (selfPct <= 30) {
    quip = `${name} runs this thread. You're on read-receipt island.`;
  } else if (selfPct >= 45 && selfPct <= 55) {
    quip = `Even split with ${name}. True conversation energy.`;
  } else if (selfPct > 55) {
    quip = `You lead the back-and-forth with ${name}. Initiator club.`;
  } else {
    quip = `${name} texts more — you're the thoughtful replier.`;
  }

  const fanLine =
    tracked > 0
      ? `${formatCount(messageCount)} messages · ${formatCount(otherCount)} from others`
      : `${formatCount(messageCount)} messages in this export`;

  return {
    empty: false,
    name,
    selfPct,
    otherPct,
    selfMessageCount: selfCount,
    otherMessageCount: otherCount,
    messageCount,
    isGroup,
    quip,
    fanLine,
    topRow: topThread
  };
}

/**
 * Spotify-style “winner” beat before a ranking slide (export-scoped — no global percentile).
 * @param {{ username?: string, count?: number, label?: string, messageCount?: number }[]} rows
 * @param {string} unit
 * @param {{ thread?: boolean }} [options]
 */
export function buildRankSpotlight(rows, unit, { thread = false } = {}) {
  const share = thread ? topThreadShareLines(rows) : topPersonShareLines(rows, unit);
  if (!rows?.length) {
    return { ...share, empty: true, name: null, topCount: 0, exportSharePct: 0, fanLine: null, quip: null, topRow: null, thread };
  }

  const top = rows[0];
  const topCount = thread ? (top.messageCount ?? 0) : (top.count ?? 0);
  const total = thread
    ? rows.reduce((s, r) => s + (r.messageCount ?? 0), 0)
    : rows.reduce((s, r) => s + (r.count ?? 0), 0);
  const exportSharePct = total > 0 ? Math.round((topCount / total) * 100) : 0;
  const name = thread
    ? formatThreadShareName(top.label)
    : `@${String(top.username ?? "").replace(/^@/, "")}`;

  const secondCount = rows.length > 1 ? (thread ? (rows[1].messageCount ?? 0) : (rows[1].count ?? 0)) : 0;
  const ratioToSecond = secondCount > 0 ? topCount / secondCount : 0;

  let fanLine;
  if (exportSharePct >= 40) {
    fanLine = `That's ${exportSharePct}% of your ${unit} in this export`;
  } else if (rows.length > 1 && ratioToSecond >= 1.5) {
    fanLine = `${ratioToSecond.toFixed(1)}× more ${unit} than #2 here`;
  } else if (rows.length > 1) {
    fanLine = `${formatCount(topCount)} ${unit} · #2 has ${formatCount(secondCount)}`;
  } else {
    fanLine = `${formatCount(topCount)} ${unit} in this export`;
  }

  const quip = buildSpotlightQuip({
    name,
    unit,
    thread,
    exportSharePct,
    topCount,
    ratioToSecond
  });

  return {
    ...share,
    empty: false,
    name,
    topCount,
    unit,
    exportSharePct,
    fanLine,
    quip,
    topRow: top,
    thread
  };
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

  const rhythmPersona = buildRhythmPersona(
    heatmap?.activeWeekdayLabel ?? null,
    heatmap?.activeHourLabel ?? null
  );
  const streakQuip = buildStreakQuip(streakDays);
  const busiestDayQuip = buildBusiestDayQuip(busiestDayLabel, busiestDay?.count ?? 0);
  const activityQuip = buildActivityQuip(total);

  return {
    exportYear,
    totalActivities: total,
    dominantFamily,
    dominantPct,
    personality,
    activityQuip,
    timePersona,
    rhythmPersona,
    streakQuip,
    busiestDayQuip,
    activityWindowTrimmed: baseline.activityWindowTrimmed ?? false,
    activeWeekday: heatmap?.activeWeekdayLabel ?? null,
    activeHour: heatmap?.activeHourLabel ?? null,
    streakDays,
    busiestDay,
    busiestDayLabel,
    busiestDayCount: busiestDay?.count ?? 0,
    socialSpotlight: buildSocialSpotlight(baseline.mostSocialCreators),
    dmBalanceSpotlight: buildDmBalanceSpotlight(baseline.topThreads?.[0] ?? null)
  };
}
