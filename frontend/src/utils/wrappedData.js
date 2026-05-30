import {
  ACTIVITY_FAMILY_COLORS,
  buildHeatmapData,
  discoverActivityFiles,
  getActivityFamilyLegend,
  getActivitySources,
  parseActivityEvents
} from "./commentHeatmap.js";
import {
  buildTopInteractions,
  discoverSocialInteractionFiles,
  getEffectiveSelfUsername,
  getSocialCategories,
  getSocialSources,
  parseSocialInteractionCounts
} from "./socialInteractionGraph.js";
import { parseProfileSearchStats } from "./profileSearches.js";
import {
  discoverMessageThreads,
  MESSAGE_FREQUENCY_TOP_N,
  parseAndAggregateThreads
} from "./messageFrequency.js";
import { filterActivityEventsForWrapped } from "./wrappedExportWindow.js";

/** Shared cap for likes / comments / story-interaction leaderboards on Wrapped. */
export const WRAPPED_SOCIAL_LEADERBOARD_LIMIT = 4;
export const WRAPPED_THREAD_CARD_LIMIT = 5;

const ACTIVITY_FAMILY_ORDER = ["comments", "likes", "media", "storyInteractions"];

/**
 * Family-level totals only for Wrapped activity (comments, likes, media, story interactions).
 * @param {object | null | undefined} heatmapData
 */
export function formatActivityBreakdownForWrapped(heatmapData) {
  if (!heatmapData?.totalsByFamily) {
    return { families: [], maxFamilyTotal: 0 };
  }

  const legendMap = new Map(getActivityFamilyLegend().map((x) => [x.family, x]));
  let maxFamilyTotal = 0;
  const families = [];
  for (const family of ACTIVITY_FAMILY_ORDER) {
    const total = heatmapData.totalsByFamily[family] || 0;
    if (total > maxFamilyTotal) {
      maxFamilyTotal = total;
    }
    const leg = legendMap.get(family);
    const color = leg?.color || ACTIVITY_FAMILY_COLORS[family] || "#64748b";
    const label = leg?.label || family;
    families.push({ family, label, color, total });
  }

  return { families, maxFamilyTotal };
}

function dedupeStrings(items) {
  const out = [];
  const seen = new Set();
  for (const msg of items) {
    if (typeof msg !== "string" || !msg.trim()) {
      continue;
    }
    if (seen.has(msg)) {
      continue;
    }
    seen.add(msg);
    out.push(msg);
  }
  return out;
}

function defaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/**
 * Loads heatmap, social graph, and messages baselines for Wrapped, reusing or filling
 * ExportDataContext caches with the same shapes as HeatmapPage, SocialGraphPage, and MessagesPage.
 *
 * @param {object} params
 * @param {File[]} params.files
 * @param {string | null} params.detectedUsername
 * @param {object | null} params.heatmapCache
 * @param {object | null} params.socialGraphCache
 * @param {object | null} params.messagesCache
 * @param {function} params.setHeatmapCache
 * @param {function} params.setSocialGraphCache
 * @param {function} params.setMessagesCache
 */
export async function loadWrappedBaseline({
  files,
  detectedUsername,
  heatmapCache,
  socialGraphCache,
  messagesCache,
  setHeatmapCache,
  setSocialGraphCache,
  setMessagesCache
}) {
  const warnings = [];
  const timezone = defaultTimezone();
  const defaultActivitySourceIds = getActivitySources().map((s) => s.id);
  const defaultSocialSourceIds = getSocialSources().map((s) => s.id);
  const selfUsername = getEffectiveSelfUsername(detectedUsername, "");

  let heatmapData = null;
  let activityWindowTrimmed = false;
  let topThreads = [];
  /** @type {Record<string, Record<string, number>> | null} */
  let socialCountsBySource = null;

  function buildWrappedHeatmap(rawEvents) {
    const { events, trimmed } = filterActivityEventsForWrapped(rawEvents);
    activityWindowTrimmed = trimmed;
    if (!events.length) {
      return null;
    }
    return buildHeatmapData(events, timezone, {
      enabledSourceIds: defaultActivitySourceIds
    });
  }

  if (heatmapCache?.rawEvents?.length) {
    heatmapData = buildWrappedHeatmap(heatmapCache.rawEvents);
    if (heatmapCache.parseWarnings?.length) {
      warnings.push(...heatmapCache.parseWarnings);
    }
  } else if (heatmapCache?.heatmapData) {
    heatmapData = heatmapCache.heatmapData;
    if (heatmapCache.parseWarnings?.length) {
      warnings.push(...heatmapCache.parseWarnings);
    }
  } else {
    const discovery = discoverActivityFiles(files);
    if (discovery.activityFiles.length === 0 || discovery.parseTargetFiles.length === 0) {
      // No cache fill; activity cards stay empty.
    } else {
      const parseResult = await parseActivityEvents(discovery);
      if (parseResult.errors?.length) {
        warnings.push(...parseResult.errors);
      }
      if (parseResult.events.length > 0) {
        heatmapData = buildWrappedHeatmap(parseResult.events);
        setHeatmapCache({
          rawEvents: parseResult.events,
          heatmapData: buildHeatmapData(parseResult.events, timezone, {
            enabledSourceIds: defaultActivitySourceIds
          }),
          enabledSourceIds: defaultActivitySourceIds,
          parseWarnings: parseResult.errors
        });
      }
    }
  }

  if (socialGraphCache?.countsBySource) {
    if (socialGraphCache.parseErrors?.length) {
      warnings.push(...socialGraphCache.parseErrors);
    }
    socialCountsBySource = socialGraphCache.countsBySource;
  } else {
    const discovery = discoverSocialInteractionFiles(files);
    if (discovery.activityFiles.length === 0 || discovery.parseTargetFiles.length === 0) {
      // skip
    } else {
      const result = await parseSocialInteractionCounts(discovery, { selfUsername });
      if (result.errors?.length) {
        warnings.push(...result.errors);
      }
      if (
        result.stats.itemsSeen > 0 &&
        result.stats.skippedMissingOwner < result.stats.itemsSeen
      ) {
        setSocialGraphCache({
          countsBySource: result.countsBySource,
          parseStats: result.stats,
          parseErrors: result.errors,
          enabledSourceIds: defaultSocialSourceIds
        });
        socialCountsBySource = result.countsBySource;
      }
    }
  }

  if (messagesCache?.rows?.length) {
    if (messagesCache.parseWarnings?.length) {
      warnings.push(...messagesCache.parseWarnings);
    }
    topThreads = messagesCache.rows.slice(0, WRAPPED_THREAD_CARD_LIMIT);
  } else {
    const discovery = discoverMessageThreads(files);
    if (discovery.activityFiles.length === 0 || discovery.inboxMessageFiles.length === 0) {
      // skip
    } else {
      const parsed = await parseAndAggregateThreads(discovery.threadBuckets, {
        selfUsername
      });
      if (parsed.warnings?.length) {
        warnings.push(...parsed.warnings);
      }
      if (parsed.stats.threadsWithMessages > 0) {
        setMessagesCache({
          rows: parsed.rows,
          stats: parsed.stats,
          threadBuckets: discovery.threadBuckets,
          parseWarnings: parsed.warnings
        });
        topThreads = parsed.rows.slice(0, WRAPPED_THREAD_CARD_LIMIT);
      }
    }
  }

  let profileSearches = {
    rows: [],
    fileFound: false,
    warnings: [],
    totalSearchEvents: 0
  };
  if (files?.length) {
    profileSearches = await parseProfileSearchStats(files, {
      selfUsername,
      topN: 5
    });
    if (profileSearches.warnings?.length) {
      warnings.push(...profileSearches.warnings);
    }
  }

  const socialCategories = getSocialCategories();
  const likesSourceIds = socialCategories.find((c) => c.id === "likes")?.sourceIds ?? [];
  const commentsCategorySourceIds =
    socialCategories.find((c) => c.id === "comments")?.sourceIds ?? [];
  const storyInteractionsCategorySourceIds =
    socialCategories.find((c) => c.id === "storyInteractions")?.sourceIds ?? [];

  function buildSocialLeaderboard(sourceIds) {
    if (socialCountsBySource == null || sourceIds.length === 0) {
      return [];
    }
    return buildTopInteractions(
      socialCountsBySource,
      sourceIds,
      WRAPPED_SOCIAL_LEADERBOARD_LIMIT
    );
  }

  const mostLikedCreators = buildSocialLeaderboard(likesSourceIds);
  const mostCommentedCreators = buildSocialLeaderboard(commentsCategorySourceIds);
  const mostStoryCreators = buildSocialLeaderboard(storyInteractionsCategorySourceIds);

  return {
    heatmapData,
    activityWindowTrimmed,
    topThreads,
    mostLikedCreators,
    mostCommentedCreators,
    mostStoryCreators,
    profileSearches,
    messagesTopN: MESSAGE_FREQUENCY_TOP_N,
    warnings: dedupeStrings(warnings)
  };
}
