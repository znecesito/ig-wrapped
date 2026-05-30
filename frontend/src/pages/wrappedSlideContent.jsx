import React from "react";
import WrappedAvatarPodium from "../components/WrappedAvatarPodium.jsx";
import { WrappedSlideLayout } from "../components/WrappedSlideChrome.jsx";
import {
  ACTIVITY_STACK,
  ACTIVITY_STACK_COMPACT,
  ACTIVITY_STACK_LABEL,
  ACTIVITY_STACK_LINK,
  ACTIVITY_STACK_SEGMENT,
  ACTIVITY_STACK_VAL,
  LEADERBOARD,
  SLIDE_BODY,
  SLIDE_BODY_ON_DARK,
  SLIDE_BULLET_LIST,
  SLIDE_BULLET_LIST_ON_DARK,
  SLIDE_CODE,
  SLIDE_HERO_COMPACT,
  SLIDE_HERO_COMPACT_ON_DARK,
  SLIDE_HERO_DISPLAY,
  SLIDE_INSIGHT_PUNCH,
  SLIDE_INSIGHT_PUNCH_ON_DARK,
  SLIDE_MEGA_LABEL,
  SLIDE_MEGA_STAT_DOMINANT,
  SLIDE_PERSONALITY_EMOJI_HERO,
  SLIDE_STAT_LABEL,
  SLIDE_STAT_VALUE,
  SLIDE_STATS_INLINE
} from "../components/wrappedSlideClasses.js";
import { getSlideAccentForTheme, stackColorFromAccent } from "../utils/wrappedPalette.js";
import { getSlideTemplate } from "../utils/wrappedThemes.js";
import { WRAPPED_THREAD_CARD_LIMIT } from "../utils/wrappedData.js";

const IG_PROFILE_BASE_URL = "https://www.instagram.com/";

function formatPrimaryDmThreadName(label) {
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

function formatCount(n) {
  return typeof n === "number" ? n.toLocaleString() : n;
}

function truncateLabel(text, max = 16) {
  if (!text || text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1)}…`;
}

function profileLink(username) {
  return `${IG_PROFILE_BASE_URL}${encodeURIComponent(username)}/`;
}

function threadStackHref(label) {
  const t = String(label || "").trim();
  if (!t || t.includes(",") || /\s+and\s+/i.test(t)) {
    return null;
  }
  const bare = t.startsWith("@") ? t.slice(1) : t;
  if (/^[\w.]+$/.test(bare)) {
    return profileLink(bare);
  }
  return null;
}

function stackLinkLabel(row, { threadLabels }) {
  if (threadLabels) {
    return truncateLabel(formatPrimaryDmThreadName(row.label), 18);
  }
  return `@${truncateLabel(String(row.username).replace(/^@/, ""), 14)}`;
}

/** Activity families use heatmap legend colors; leaderboards use accent-tinted stacks. */
function renderActivityStack(families, maxFamilyTotal, { linkable = false, compact = false } = {}) {
  return (
    <div className={compact ? ACTIVITY_STACK_COMPACT : ACTIVITY_STACK} aria-label="Breakdown">
      {families.map((fam, index) => {
        const total = fam.total ?? fam.count ?? fam.messageCount ?? 0;
        const flexGrow = maxFamilyTotal > 0 ? Math.max(total, 1) : 1;
        const text = fam.linkLabel ?? fam.label ?? fam.displayLabel;
        const labelNode =
          linkable && fam.href ? (
            <a
              className={ACTIVITY_STACK_LINK}
              href={fam.href}
              target="_blank"
              rel="noreferrer"
              title={fam.linkTitle ?? text}
            >
              {text}
            </a>
          ) : (
            <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{text}</span>
          );

        return (
          <div
            key={fam.family ?? fam.username ?? fam.threadKey ?? index}
            className={ACTIVITY_STACK_SEGMENT}
            style={{
              flexGrow,
              backgroundColor: fam.color
            }}
          >
            <span className={ACTIVITY_STACK_LABEL}>{labelNode}</span>
            <span className={ACTIVITY_STACK_VAL}>{formatCount(total)}</span>
          </div>
        );
      })}
    </div>
  );
}

function renderLeaderboardBlock(rows, { threadLabels = false, accent }) {
  if (!rows.length) {
    return null;
  }
  const maxCount = Math.max(...rows.map((r) => r.count ?? r.messageCount ?? 0));

  const stackFamilies = rows.map((row, index) => {
    const total = row.count ?? row.messageCount ?? 0;
    const href = threadLabels ? threadStackHref(row.label) : profileLink(row.username);
    return {
      family: row.username ?? row.threadKey ?? index,
      linkLabel: stackLinkLabel(row, { threadLabels }),
      linkTitle: threadLabels ? row.label : `@${String(row.username).replace(/^@/, "")}`,
      href,
      total,
      color: stackColorFromAccent(accent, index)
    };
  });

  return (
    <div className={LEADERBOARD}>
      <WrappedAvatarPodium rows={rows} threadLabels={threadLabels} />
      {renderActivityStack(stackFamilies, maxCount, { linkable: true, compact: true })}
    </div>
  );
}

/** Spotify-style winner beat before a ranking slide (export-scoped copy). */
function renderRankSpotlight({ eyebrow, categoryLabel, spotlight, unitLabel, emptyMessage }) {
  if (!spotlight || spotlight.empty || !spotlight.topCount) {
    return (
      <WrappedSlideLayout template="hero" eyebrow={eyebrow} title={categoryLabel} deck={emptyMessage}>
        <p className={SLIDE_BODY_ON_DARK}>{emptyMessage}</p>
      </WrappedSlideLayout>
    );
  }

  return (
    <WrappedSlideLayout
      template="hero"
      eyebrow={eyebrow}
      title={categoryLabel}
      deck={spotlight.name}
      bodyClassName="hero"
      footerStat={
        spotlight.subline ? <span className="text-[var(--slide-fg-muted)]">{spotlight.subline}</span> : null
      }
    >
      <p className={SLIDE_MEGA_STAT_DOMINANT}>{formatCount(spotlight.topCount)}</p>
      <p className={SLIDE_MEGA_LABEL}>{unitLabel}</p>
      {spotlight.fanLine ? (
        <p className={SLIDE_INSIGHT_PUNCH_ON_DARK}>{spotlight.fanLine}</p>
      ) : null}
    </WrappedSlideLayout>
  );
}

/** Podium + stack ranking (follows spotlight). */
function renderRankLeaderboard({
  template,
  eyebrow,
  title,
  deck,
  rows,
  accentTheme,
  threadLabels = false,
  emptyMessage
}) {
  const accent = getSlideAccentForTheme(accentTheme);

  return (
    <WrappedSlideLayout template={template} eyebrow={eyebrow} title={title} deck={deck}>
      {rows.length > 0 ? (
        renderLeaderboardBlock(rows, { threadLabels, accent })
      ) : (
        <p className={SLIDE_BODY}>{emptyMessage}</p>
      )}
    </WrappedSlideLayout>
  );
}

export function renderWrappedSlide(index, ctx) {
  const { baseline, handle, activityBreakdown, insights } = ctx;
  const yearLabel = insights?.exportYear ? String(insights.exportYear) : "Your export";
  const template = getSlideTemplate(index);

  switch (index) {
    case 0:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow={insights?.exportYear ? `${insights.exportYear} · ig-wrapped` : "ig-wrapped"}
          title="Your feed, wrapped"
          deck="Screenshot any card for Stories · all local"
          bodyClassName="hero"
        >
          <p className={SLIDE_HERO_DISPLAY}>{handle}</p>
          <p className={SLIDE_BODY_ON_DARK}>
            {insights?.totalActivities > 0
              ? `${formatCount(insights.totalActivities)} activities · people · DMs`
              : "Activity · people · DMs"}
          </p>
        </WrappedSlideLayout>
      );

    case 1:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="In this export"
          title={yearLabel === "Your export" ? "Your activity span" : `Your ${yearLabel} in the feed`}
          deck="Timestamps in this folder — not your full IG history"
          bodyClassName="hero"
        >
          {baseline.heatmapData ? (
            <>
              <p className={SLIDE_HERO_COMPACT_ON_DARK}>{baseline.heatmapData.dateRangeLabel}</p>
              <p className={SLIDE_BODY_ON_DARK}>Comments · likes · media · stories</p>
            </>
          ) : (
            <p className={SLIDE_BODY_ON_DARK}>No activity timestamps in this folder.</p>
          )}
        </WrappedSlideLayout>
      );

    case 2:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="The big number"
          title={
            insights?.dominantPct >= 35 && insights?.personality
              ? `${insights.dominantPct}% ${insights.personality.label}`
              : "Your activity"
          }
          deck="What you actually did in this export"
          footerStat={
            baseline.heatmapData?.totalActivities > 0 ? (
              <>
                {formatCount(baseline.heatmapData.totalActivities)} total · peak{" "}
                {baseline.heatmapData.activeWeekdayLabel}
              </>
            ) : null
          }
        >
          {baseline.heatmapData && baseline.heatmapData.totalActivities > 0 ? (
            <>
              <p className={SLIDE_MEGA_STAT_DOMINANT}>
                {formatCount(baseline.heatmapData.totalActivities)}
              </p>
              <p className={SLIDE_MEGA_LABEL}>activities in this export</p>
              {insights?.activityPunchline ? (
                <p className={SLIDE_INSIGHT_PUNCH}>{insights.activityPunchline}</p>
              ) : null}
              {renderActivityStack(
                activityBreakdown.families,
                activityBreakdown.maxFamilyTotal
              )}
              <ul className={SLIDE_STATS_INLINE}>
                <li>
                  <span className={SLIDE_STAT_LABEL}>Busiest weekday</span>
                  <span className={SLIDE_STAT_VALUE}>{baseline.heatmapData.activeWeekdayLabel}</span>
                </li>
                <li>
                  <span className={SLIDE_STAT_LABEL}>Busiest hour</span>
                  <span className={SLIDE_STAT_VALUE}>{baseline.heatmapData.activeHourLabel}</span>
                </li>
              </ul>
            </>
          ) : (
            <p className={SLIDE_BODY}>No activity data in this export.</p>
          )}
        </WrappedSlideLayout>
      );

    case 3:
      return renderRankSpotlight({
        eyebrow: "Likes",
        categoryLabel: "Your top liked creator",
        spotlight: insights?.likesSpotlight,
        unitLabel: "likes in this export",
        emptyMessage: "No likes counted in this export."
      });

    case 4:
      return renderRankLeaderboard({
        template,
        eyebrow: "Likes",
        title: "Top liked creators",
        deck: "Ranked in this export",
        rows: baseline.mostLikedCreators,
        accentTheme: "likes",
        emptyMessage: "No likes counted in this export."
      });

    case 5:
      return renderRankSpotlight({
        eyebrow: "Comments",
        categoryLabel: "Your top commented creator",
        spotlight: insights?.commentsSpotlight,
        unitLabel: "comments in this export",
        emptyMessage: "No comments counted in this export."
      });

    case 6:
      return renderRankLeaderboard({
        template,
        eyebrow: "Comments",
        title: "Top commented creators",
        deck: "Posts, reels & stories",
        rows: baseline.mostCommentedCreators,
        accentTheme: "comments",
        emptyMessage: "No comments counted in this export."
      });

    case 7:
      return renderRankSpotlight({
        eyebrow: "Stories",
        categoryLabel: "Your top story interaction",
        spotlight: insights?.storiesSpotlight,
        unitLabel: "story interactions in this export",
        emptyMessage: "No story interactions in this export."
      });

    case 8:
      return renderRankLeaderboard({
        template,
        eyebrow: "Stories",
        title: "Top story interactions",
        deck: "Polls · views · reactions",
        rows: baseline.mostStoryCreators,
        accentTheme: "stories",
        emptyMessage: "No story interactions in this export."
      });

    case 9:
      return renderRankSpotlight({
        eyebrow: "Inbox",
        categoryLabel: "Your top DM thread",
        spotlight: insights?.dmsSpotlight,
        unitLabel: "messages in this export",
        emptyMessage: "No threads in this export."
      });

    case 10:
      return renderRankLeaderboard({
        template,
        eyebrow: "Inbox",
        title: "Top DM threads",
        deck: `Top ${WRAPPED_THREAD_CARD_LIMIT} by message count`,
        rows: baseline.topThreads,
        accentTheme: "dms",
        threadLabels: true,
        emptyMessage: "No threads in this export."
      });

    case 11:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Your feed personality"
          title={insights?.personality?.title ?? "Still loading your vibe"}
          deck={insights?.personality?.tagline ?? "Load activity data to see your club"}
          bodyClassName="hero-list"
          footerStat={
            insights?.personality
              ? `${insights.personality.emoji} ${insights.dominantPct >= 20 ? `${insights.dominantPct}% ${insights.personality.label}` : insights.personality.label}`
              : null
          }
        >
          {insights?.personality ? (
            <>
              <p className={SLIDE_PERSONALITY_EMOJI_HERO} aria-hidden>
                {insights.personality.emoji}
              </p>
              <ul className={SLIDE_BULLET_LIST_ON_DARK}>
                {insights.dominantPct >= 20 ? (
                  <li>
                    <strong>{insights.dominantPct}%</strong> of activity was {insights.personality.label}
                  </li>
                ) : null}
                {insights.timePersona && insights.activeHour ? (
                  <li>
                    Peak hour <strong>{insights.activeHour}</strong> — {insights.timePersona}
                  </li>
                ) : null}
                {insights.streakDays >= 2 ? (
                  <li>
                    Longest active streak: <strong>{insights.streakDays} days</strong> in this export
                  </li>
                ) : null}
                {insights.busiestDayLabel && insights.busiestDayCount > 0 ? (
                  <li>
                    Busiest day: <strong>{insights.busiestDayLabel}</strong> (
                    {formatCount(insights.busiestDayCount)} activities)
                  </li>
                ) : null}
              </ul>
            </>
          ) : (
            <p className={SLIDE_BODY_ON_DARK}>
              Not enough activity in this export for a personality card. Try a longer date range in
              Instagram&apos;s export settings.
            </p>
          )}
        </WrappedSlideLayout>
      );

    case 12:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Privacy"
          title="Local only"
          deck="Your export is not uploaded for Wrapped"
          footerStat="Non-Followers is the only server upload"
        >
          <ul className={SLIDE_BULLET_LIST}>
            <li>Runs entirely in your browser</li>
            <li>Clear data from the nav on shared devices</li>
          </ul>
        </WrappedSlideLayout>
      );

    default:
      return null;
  }
}
