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
  SLIDE_HERO_DISPLAY,
  SLIDE_INSIGHT_PUNCH_ON_DARK,
  SLIDE_MEGA_LABEL,
  SLIDE_MEGA_STAT_DOMINANT,
  SLIDE_PERSONALITY_EMOJI_HERO
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
  const template = getSlideTemplate(index);
  const year = insights?.exportYear;

  switch (index) {
    case 0:
      return (
        <WrappedSlideLayout
          template={template}
          title={year ? `Your ${year} feed, wrapped` : "Your feed, wrapped"}
          bodyClassName="hero"
        >
          <p className={SLIDE_HERO_DISPLAY}>{handle}</p>
          <p className={SLIDE_BODY_ON_DARK}>
            {insights?.totalActivities > 0
              ? `${formatCount(insights.totalActivities)} activities · people · DMs`
              : "Load activity to see your recap"}
          </p>
        </WrappedSlideLayout>
      );

    case 1:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Your feed personality"
          title={insights?.personality?.title ?? "Your vibe"}
          deck={insights?.personality?.tagline ?? ""}
          bodyClassName="hero"
        >
          {insights?.personality && insights.dominantPct >= 1 ? (
            <>
              <p className={SLIDE_PERSONALITY_EMOJI_HERO} aria-hidden>
                {insights.personality.emoji}
              </p>
              <p className={SLIDE_MEGA_STAT_DOMINANT}>{insights.dominantPct}%</p>
              <p className={SLIDE_MEGA_LABEL}>{insights.personality.label}</p>
            </>
          ) : (
            <p className={SLIDE_BODY_ON_DARK}>Not enough activity for a personality read yet.</p>
          )}
        </WrappedSlideLayout>
      );

    case 2:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Activity mix"
          title="How you showed up"
          deck={
            insights?.activityWindowTrimmed
              ? "Counts from your most recent 365 days of activity"
              : "In this export"
          }
        >
          {baseline.heatmapData && baseline.heatmapData.totalActivities > 0 ? (
            <>
              <p className={SLIDE_MEGA_STAT_DOMINANT}>
                {formatCount(baseline.heatmapData.totalActivities)}
              </p>
              <p className={SLIDE_MEGA_LABEL}>total activities</p>
              {renderActivityStack(
                activityBreakdown.families,
                activityBreakdown.maxFamilyTotal
              )}
            </>
          ) : (
            <p className={SLIDE_BODY}>No activity data in this export.</p>
          )}
        </WrappedSlideLayout>
      );

    case 3:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Your rhythm"
          title={insights?.rhythmPersona?.title ?? "When you're online"}
          deck={
            insights?.rhythmPersona
              ? `${insights.rhythmPersona.activeWeekday} · ${insights.rhythmPersona.activeHour.replace(":00", "")}`
              : "Peak weekday and hour in this export"
          }
          bodyClassName="hero"
        >
          {insights?.rhythmPersona ? (
            <p className={SLIDE_INSIGHT_PUNCH_ON_DARK}>{insights.rhythmPersona.quip}</p>
          ) : (
            <p className={SLIDE_BODY_ON_DARK}>No rhythm pattern in this export yet.</p>
          )}
        </WrappedSlideLayout>
      );

    case 4:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Dedication"
          title="Longest streak"
          deck="Consecutive active days"
          bodyClassName="hero"
        >
          {insights?.streakDays >= 2 ? (
            <>
              <p className={SLIDE_MEGA_STAT_DOMINANT}>{insights.streakDays}</p>
              <p className={SLIDE_MEGA_LABEL}>days in a row</p>
              {insights.streakQuip ? (
                <p className={SLIDE_INSIGHT_PUNCH_ON_DARK}>{insights.streakQuip}</p>
              ) : null}
            </>
          ) : (
            <p className={SLIDE_BODY_ON_DARK}>No multi-day streak in this export.</p>
          )}
        </WrappedSlideLayout>
      );

    case 5:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Peak day"
          title={insights?.busiestDayLabel ?? "Busiest day"}
          deck="Most activity in one day"
          bodyClassName="hero"
        >
          {insights?.busiestDayCount > 0 ? (
            <>
              <p className={SLIDE_MEGA_STAT_DOMINANT}>{formatCount(insights.busiestDayCount)}</p>
              <p className={SLIDE_MEGA_LABEL}>activities</p>
              {insights.busiestDayQuip ? (
                <p className={SLIDE_INSIGHT_PUNCH_ON_DARK}>{insights.busiestDayQuip}</p>
              ) : null}
            </>
          ) : (
            <p className={SLIDE_BODY_ON_DARK}>No standout day in this export.</p>
          )}
        </WrappedSlideLayout>
      );

    case 6:
      return renderRankSpotlight({
        eyebrow: "Likes",
        categoryLabel: "Your top liked creator",
        spotlight: insights?.likesSpotlight,
        unitLabel: "likes in this export",
        emptyMessage: "No likes counted in this export."
      });

    case 7:
      return renderRankLeaderboard({
        template,
        eyebrow: "Likes",
        title: "Top liked creators",
        deck: "Ranked in this export",
        rows: baseline.mostLikedCreators,
        accentTheme: "likes",
        emptyMessage: "No likes counted in this export."
      });

    case 8:
      return renderRankSpotlight({
        eyebrow: "Comments",
        categoryLabel: "Your top commented creator",
        spotlight: insights?.commentsSpotlight,
        unitLabel: "comments in this export",
        emptyMessage: "No comments counted in this export."
      });

    case 9:
      return renderRankLeaderboard({
        template,
        eyebrow: "Comments",
        title: "Top commented creators",
        deck: "Posts, reels & stories",
        rows: baseline.mostCommentedCreators,
        accentTheme: "comments",
        emptyMessage: "No comments counted in this export."
      });

    case 10:
      return renderRankSpotlight({
        eyebrow: "Stories",
        categoryLabel: "Your top story interaction",
        spotlight: insights?.storiesSpotlight,
        unitLabel: "story interactions in this export",
        emptyMessage: "No story interactions in this export."
      });

    case 11:
      return renderRankLeaderboard({
        template,
        eyebrow: "Stories",
        title: "Top story interactions",
        deck: "Polls · views · reactions",
        rows: baseline.mostStoryCreators,
        accentTheme: "stories",
        emptyMessage: "No story interactions in this export."
      });

    case 12:
      return renderRankSpotlight({
        eyebrow: "Inbox",
        categoryLabel: "Your top DM thread",
        spotlight: insights?.dmsSpotlight,
        unitLabel: "messages in this export",
        emptyMessage: "No threads in this export."
      });

    case 13:
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

    case 14:
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
