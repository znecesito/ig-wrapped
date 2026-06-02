import React from "react";
import DropDownText from "../components/DropDownText.jsx";
import InboxNotificationStack from "../components/InboxNotificationStack.jsx";
import PeopleRankChart from "../components/PeopleRankChart.jsx";
import RhythmDayFlip from "../components/RhythmDayFlip.jsx";
import WrappedAvatarPodium from "../components/WrappedAvatarPodium.jsx";
import WrappedSpotlightHero from "../components/WrappedSpotlightHero.jsx";
import { WrappedSlideLayout } from "../components/WrappedSlideChrome.jsx";
import { cn } from "../lib/utils.js";
import {
  ACTIVITY_STACK,
  ACTIVITY_STACK_TALL,
  ACTIVITY_STACK_COMPACT,
  ACTIVITY_STACK_LABEL,
  ACTIVITY_STACK_LINK,
  ACTIVITY_STACK_SEGMENT,
  ACTIVITY_STACK_SEGMENT_GROW,
  ACTIVITY_STACK_BAR_FILL,
  ACTIVITY_STACK_VAL,
  LEADERBOARD,
  SLIDE_BODY,
  SLIDE_BODY_ON_DARK,
  SLIDE_BULLET_LIST,
  SLIDE_HERO_DISPLAY,
  SLIDE_INSIGHT_PUNCH,
  SLIDE_INSIGHT_PUNCH_ON_DARK,
  SLIDE_MEGA_LABEL,
  SLIDE_MEGA_STAT_DOMINANT,
  slideTitleClass
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

/** Visual flex weight — small real counts still get a readable slice of the stack. */
function activityStackFlexGrow(total, maxFamilyTotal, { growMode = false } = {}) {
  if (!growMode) {
    return maxFamilyTotal > 0 ? Math.max(total, 1) : 1;
  }
  const floor = Math.max(maxFamilyTotal * 0.14, 3);
  if (total <= 0) {
    return floor * 0.5;
  }
  return Math.max(total, floor);
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
function renderActivityStack(
  families,
  maxFamilyTotal,
  { linkable = false, compact = false, raceMode = false, growMode = false } = {}
) {
  const items = families;

  return (
    <div
      className={
        growMode ? ACTIVITY_STACK_TALL : compact ? ACTIVITY_STACK_COMPACT : ACTIVITY_STACK
      }
      aria-label="Breakdown"
      {...(raceMode ? { "data-wrapped-race-stack": true } : {})}
      {...(growMode ? { "data-activity-stack": true } : {})}
    >
      {items.map((fam, index) => {
        const total = fam.total ?? fam.count ?? fam.messageCount ?? 0;
        const flexGrow = activityStackFlexGrow(total, maxFamilyTotal, { growMode });
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

        const segmentProps = raceMode
          ? {
              "data-wrapped-race-segment": true,
              "data-race-rank": String(index),
              "data-race-flex": String(flexGrow),
              "data-race-count": String(total)
            }
          : growMode
            ? {
                "data-activity-segment": true,
                "data-activity-flex": String(flexGrow)
              }
            : { "data-wrapped-beat-segment": true };

        return (
          <div
            key={fam.family ?? fam.username ?? fam.threadKey ?? index}
            className={growMode ? ACTIVITY_STACK_SEGMENT_GROW : ACTIVITY_STACK_SEGMENT}
            {...segmentProps}
            style={{
              flexGrow: raceMode ? 0.01 : flexGrow,
              ...(growMode ? null : { backgroundColor: fam.color })
            }}
          >
            {growMode ? (
              <div
                className={ACTIVITY_STACK_BAR_FILL}
                data-activity-bar-fill
                style={{
                  backgroundColor: fam.color,
                  ...(total <= 0 ? { opacity: 0.45 } : null)
                }}
              >
                <span className={ACTIVITY_STACK_LABEL} data-activity-bar-label>
                  {labelNode}
                </span>
                <span className={ACTIVITY_STACK_VAL} data-activity-bar-value>
                  {formatCount(total)}
                </span>
              </div>
            ) : (
              <>
                <span className={ACTIVITY_STACK_LABEL}>{labelNode}</span>
                <span
                  className={ACTIVITY_STACK_VAL}
                  {...(raceMode ? { "data-race-count": String(total) } : {})}
                >
                  {raceMode ? "0" : formatCount(total)}
                </span>
              </>
            )}
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
      <WrappedAvatarPodium rows={rows} threadLabels={threadLabels} raceMode />
      {renderActivityStack(stackFamilies, maxCount, { linkable: true, compact: true, raceMode: true })}
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
          <span className="text-[var(--slide-fg-muted)]">{spotlight.fanLine}</span>
        ) : null
      }
    >
      <WrappedSpotlightHero
        name={spotlight.name}
        row={spotlight.topRow}
        threadLabels={spotlight.thread}
      />
      <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat" data-wrapped-drop>
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

/** Inbox slide — IG notification stack, then busiest thread stats. */
function renderInboxSlide({ spotlight, emptyMessage }) {
  if (!spotlight || spotlight.empty || !spotlight.messageCount) {
    return (
      <WrappedSlideLayout template="hero" hideHeader>
        <p className={SLIDE_MEGA_LABEL} data-wrapped-beat-static>
          Inbox
        </p>
        <p className={SLIDE_BODY_ON_DARK} data-wrapped-beat="body">
          {emptyMessage}
        </p>
      </WrappedSlideLayout>
    );
  }

  const hasBalance = (spotlight.selfPct ?? 0) > 0 || (spotlight.otherPct ?? 0) > 0;

  return (
    <WrappedSlideLayout
      template="hero"
      hideHeader
      footerStat={
        spotlight.fanLine ? (
          <span className="text-[var(--slide-fg-muted)]">{spotlight.fanLine}</span>
        ) : null
      }
    >
      <p className={SLIDE_MEGA_LABEL} data-wrapped-beat-static>
        Inbox
      </p>
      <InboxNotificationStack
        threadName={spotlight.name}
        stackCount={spotlight.notificationStackCount ?? 4}
      />
      {spotlight.busiestLine ? (
        <p className={SLIDE_BODY_ON_DARK} data-wrapped-beat="inbox-desc">
          {spotlight.busiestLine}
        </p>
      ) : null}
      {spotlight.exportSharePct > 0 ? (
        <>
          <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat">
            {spotlight.exportSharePct}%
          </p>
          <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="stat-label">
            of your messages in this export
          </p>
        </>
      ) : null}
      {hasBalance ? (
        <>
          <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="inbox-balance">
            {spotlight.selfPct}%
          </p>
          <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="inbox-balance-label">
            {spotlight.balanceLabel}
          </p>
        </>
      ) : null}
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
    case 0: {
      const introTitle = year ? `Your ${year} feed, wrapped` : "Your feed, wrapped";
      const activityLine =
        insights?.totalActivities > 0
          ? `${formatCount(insights.totalActivities)} activities · people · DMs`
          : "Load activity to see your recap";

      return (
        <WrappedSlideLayout template={template} bodyClassName="hero">
          <DropDownText
            beat="title"
            text={introTitle}
            className={cn(slideTitleClass(template), "mb-4")}
          />
          <DropDownText beat="hero" text={handle} className={cn(SLIDE_HERO_DISPLAY, "mb-3")} />
          <DropDownText beat="body" text={activityLine} className={SLIDE_BODY_ON_DARK} />
        </WrappedSlideLayout>
      );
    }

    case 1: {
      const total = baseline.heatmapData?.totalActivities ?? 0;
      const hasData = baseline.heatmapData && total > 0;

      return (
        <WrappedSlideLayout template={template} hideHeader>
          {hasData ? (
            <>
              <p className={SLIDE_MEGA_LABEL} data-wrapped-beat-static>
                Activity
              </p>
              <div className="w-full max-w-[18rem]" data-wrapped-beat="chart">
                {renderActivityStack(
                  activityBreakdown.families,
                  activityBreakdown.maxFamilyTotal,
                  { growMode: true }
                )}
              </div>
              <p className={SLIDE_MEGA_STAT_DOMINANT} data-wrapped-beat="stat">
                {formatCount(total)}
              </p>
              <p className={SLIDE_MEGA_LABEL} data-wrapped-beat="stat-label">
                total activity all year
              </p>
              {insights?.activityQuip ? (
                <p className={SLIDE_INSIGHT_PUNCH} data-wrapped-beat="quip">
                  {insights.activityQuip}
                </p>
              ) : null}
            </>
          ) : (
            <p className={SLIDE_BODY} data-wrapped-beat="body">
              No activity data in this export.
            </p>
          )}
        </WrappedSlideLayout>
      );
    }

    case 2:
      return (
        <WrappedSlideLayout template={template} hideHeader bodyClassName="hero">
          {insights?.rhythmPersona ? (
            <>
              <p className={cn(SLIDE_MEGA_LABEL, "text-white/85")} data-wrapped-beat-static>
                Your rhythm
              </p>
              <RhythmDayFlip
                activeWeekday={insights.rhythmPersona.activeWeekday}
                displayWeekday={insights.rhythmPersona.displayWeekday}
              />
              <p className={SLIDE_HERO_DISPLAY} data-wrapped-beat="rhythm-title">
                {insights.rhythmPersona.title}
              </p>
              <p className={SLIDE_INSIGHT_PUNCH_ON_DARK} data-wrapped-beat="quip">
                {insights.rhythmPersona.quip}
              </p>
            </>
          ) : (
            <p className={SLIDE_BODY_ON_DARK} data-wrapped-beat="body">
              No rhythm pattern in this export yet.
            </p>
          )}
        </WrappedSlideLayout>
      );

    case 3:
      return (
        <WrappedSlideLayout template={template} hideHeader>
          {baseline.peopleRankHistory && insights?.peopleQuip ? (
            <>
              <p className={SLIDE_MEGA_LABEL} data-wrapped-beat-static>
                People
              </p>
              <PeopleRankChart history={baseline.peopleRankHistory} />
              <p className={SLIDE_INSIGHT_PUNCH} data-wrapped-beat="quip">
                {insights.peopleQuip}
              </p>
            </>
          ) : (
            <p className={SLIDE_BODY} data-wrapped-beat="body">
              No social interactions in this export.
            </p>
          )}
        </WrappedSlideLayout>
      );

    case 4:
      return renderInboxSlide({
        spotlight: insights?.dmBalanceSpotlight,
        emptyMessage: "No threads in this export."
      });

    case 5:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Privacy"
          title="Local only"
          deck="Your export is not uploaded for Wrapped"
          footerStat="Non-Followers is the only server upload"
        >
          <ul className={SLIDE_BULLET_LIST} data-wrapped-beat="body">
            <li data-wrapped-beat-segment>Runs entirely in your browser</li>
            <li data-wrapped-beat-segment>Clear data from the nav on shared devices</li>
          </ul>
        </WrappedSlideLayout>
      );

    default:
      return null;
  }
}
