import React from "react";
import WrappedAvatarPodium from "../components/WrappedAvatarPodium.jsx";
import WrappedSpotlightHero from "../components/WrappedSpotlightHero.jsx";
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

/** Spotify-style winner / spotlight beat before a ranking slide. */
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
      bodyClassName="hero"
      footerStat={
        spotlight.fanLine ? (
          <span className="text-[var(--slide-fg-muted)]" data-wrapped-beat="footer">
            {spotlight.fanLine}
          </span>
        ) : null
      }
    >
      <WrappedSpotlightHero
        name={spotlight.name}
        row={spotlight.topRow}
        threadLabels={spotlight.thread}
      />
      <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat">
        {formatCount(spotlight.topCount)}
      </p>
      <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="stat-label">
        {unitLabel}
      </p>
      {spotlight.quip ? (
        <p className={SLIDE_INSIGHT_PUNCH_ON_DARK} data-wrapped-beat="quip">
          {spotlight.quip}
        </p>
      ) : null}
    </WrappedSlideLayout>
  );
}

/** Inbox-wide personality (all threads in export). */
function renderInboxPersonalitySpotlight({ spotlight, emptyMessage }) {
  if (!spotlight || spotlight.empty || !spotlight.totalMessages) {
    return (
      <WrappedSlideLayout
        template="hero"
        eyebrow="Inbox"
        title="Your inbox personality"
        deck={emptyMessage}
      >
        <p className={SLIDE_BODY_ON_DARK}>{emptyMessage}</p>
      </WrappedSlideLayout>
    );
  }

  return (
    <WrappedSlideLayout
      template="hero"
      eyebrow="Inbox"
      title={spotlight.title ?? "Your inbox personality"}
      deck="Across every thread in this export"
      bodyClassName="hero"
      footerStat={
        spotlight.fanLine ? (
          <span className="text-[var(--slide-fg-muted)]" data-wrapped-beat="footer">
            {spotlight.fanLine}
          </span>
        ) : null
      }
    >
      <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat">
        {spotlight.heroPct}%
      </p>
      <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="stat-label">
        {spotlight.heroLabel}
      </p>
      {spotlight.selfPct != null ? (
        <p className={SLIDE_BODY_ON_DARK} data-wrapped-beat="stat-secondary">
          {spotlight.selfPct}% you · {spotlight.groupPct}% in groups
        </p>
      ) : null}
      {spotlight.quip ? (
        <p className={SLIDE_INSIGHT_PUNCH_ON_DARK} data-wrapped-beat="quip">
          {spotlight.quip}
        </p>
      ) : null}
    </WrappedSlideLayout>
  );
}

/** You vs them balance in the busiest DM thread. */
function renderDmBalanceSpotlight({ spotlight, emptyMessage }) {
  if (!spotlight || spotlight.empty || !spotlight.messageCount) {
    return (
      <WrappedSlideLayout
        template="hero"
        eyebrow="Inbox"
        title="You vs them"
        deck={emptyMessage}
      >
        <p className={SLIDE_BODY_ON_DARK}>{emptyMessage}</p>
      </WrappedSlideLayout>
    );
  }

  const balanceLabel = spotlight.isGroup ? "you in this group" : "you sent";

  return (
    <WrappedSlideLayout
      template="hero"
      eyebrow="Inbox"
      title={spotlight.isGroup ? "Your group chat energy" : "You vs them"}
      deck={`Busiest thread · ${spotlight.name}`}
      bodyClassName="hero"
      footerStat={
        spotlight.fanLine ? (
          <span className="text-[var(--slide-fg-muted)]" data-wrapped-beat="footer">
            {spotlight.fanLine}
          </span>
        ) : null
      }
    >
      <WrappedSpotlightHero
        name={spotlight.name}
        row={spotlight.topRow}
        threadLabels
      />
      {spotlight.selfPct > 0 || spotlight.otherPct > 0 ? (
        <>
          <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat">
            {spotlight.selfPct}%
          </p>
          <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="stat-label">
            {balanceLabel}
          </p>
          {!spotlight.isGroup ? (
            <p className={SLIDE_BODY_ON_DARK} data-wrapped-beat="stat-secondary">
              {spotlight.otherPct}% from {spotlight.name}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat">
            {formatCount(spotlight.messageCount)}
          </p>
          <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="stat-label">
            messages in this export
          </p>
        </>
      )}
      {spotlight.quip ? (
        <p className={SLIDE_INSIGHT_PUNCH_ON_DARK} data-wrapped-beat="quip">
          {spotlight.quip}
        </p>
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
            insights?.rhythmPersona?.deckLabel ?? "Peak weekday and hour in this export"
          }
          bodyClassName="hero"
        >
          {insights?.rhythmPersona ? (
            <p className={SLIDE_INSIGHT_PUNCH_ON_DARK} data-wrapped-beat="quip">
              {insights.rhythmPersona.quip}
            </p>
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
        eyebrow: "People",
        categoryLabel: "Your #1 person",
        spotlight: insights?.socialSpotlight,
        unitLabel: "interactions in this export",
        emptyMessage: "No likes, comments, or story interactions in this export."
      });

    case 7:
      return renderRankLeaderboard({
        template,
        eyebrow: "People",
        title: "Top accounts",
        deck: "Likes · comments · story taps",
        rows: baseline.mostSocialCreators,
        accentTheme: "activity",
        emptyMessage: "No social interactions in this export."
      });

    case 8:
      return renderInboxPersonalitySpotlight({
        spotlight: insights?.inboxPersonalitySpotlight,
        emptyMessage: "No threads in this export."
      });

    case 9:
      return renderDmBalanceSpotlight({
        spotlight: insights?.dmBalanceSpotlight,
        emptyMessage: "No threads in this export."
      });

    case 10:
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
