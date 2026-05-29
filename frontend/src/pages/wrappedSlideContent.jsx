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
  SLIDE_FOOTER_LINK,
  SLIDE_HERO,
  SLIDE_HERO_COMPACT,
  SLIDE_HERO_COMPACT_ON_DARK,
  SLIDE_HERO_DISPLAY,
  SEARCH_RANK_COUNT,
  SEARCH_RANK_NAME,
  SEARCH_RANK_NUM,
  SEARCH_RANK_REST,
  SEARCH_RANK_ROW,
  SLIDE_INSIGHT_PUNCH,
  SLIDE_MEGA_LABEL,
  SLIDE_MEGA_STAT,
  SLIDE_MEGA_STAT_DOMINANT,
  SLIDE_MEGA_STAT_SM,
  SLIDE_PERSONALITY_EMOJI,
  SLIDE_PERSONALITY_EMOJI_HERO,
  SLIDE_PERSONALITY_TITLE,
  SLIDE_PERSONALITY_TITLE_HERO,
  SLIDE_SHARE_HEADLINE,
  SLIDE_STAT_LABEL,
  SLIDE_STAT_VALUE,
  SLIDE_STATS_INLINE
} from "../components/wrappedSlideClasses.js";
import { getSlideAccent, stackColorFromAccent } from "../utils/wrappedPalette.js";
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

function mergedFooterStat(username, count, unit, { thread = false } = {}) {
  if (thread) {
    return (
      <>
        <strong>{formatPrimaryDmThreadName(username)}</strong> · {formatCount(count)} {unit}
      </>
    );
  }
  const handle = `@${String(username).replace(/^@/, "")}`;
  return (
    <>
      <strong>{handle}</strong> · {formatCount(count)} {unit}
    </>
  );
}

function profileLink(username) {
  return `${IG_PROFILE_BASE_URL}${encodeURIComponent(username)}/`;
}

function likesFooterQuip(top) {
  const handle = `@${String(top.username).replace(/^@/, "")}`;
  return (
    <p>
      Rent&apos;s due on your attention span —{" "}
      <a className={SLIDE_FOOTER_LINK} href={profileLink(top.username)} target="_blank" rel="noreferrer">
        {handle}
      </a>{" "}
      earned <strong>{formatCount(top.count)}</strong> of your likes here. The algorithm simply watches.
    </p>
  );
}

function commentsFooterQuip(top) {
  const handle = `@${String(top.username).replace(/^@/, "")}`;
  return (
    <p>
      The comment box remembers —{" "}
      <a className={SLIDE_FOOTER_LINK} href={profileLink(top.username)} target="_blank" rel="noreferrer">
        {handle}
      </a>{" "}
      collected <strong>{formatCount(top.count)}</strong> of your replies here. Caps lock optional;
      sincerity wasn&apos;t.
    </p>
  );
}

function storiesFooterQuip(top) {
  const handle = `@${String(top.username).replace(/^@/, "")}`;
  return (
    <p>
      Your story lane had a main character —{" "}
      <a className={SLIDE_FOOTER_LINK} href={profileLink(top.username)} target="_blank" rel="noreferrer">
        {handle}
      </a>{" "}
      shows up <strong>{formatCount(top.count)}</strong> times across polls, taps, and views here. The
      ring doesn&apos;t lie.
    </p>
  );
}

function dmsFooterQuip(top) {
  return (
    <p>
      You traded the most messages with <strong>{formatPrimaryDmThreadName(top.label)}</strong> —{" "}
      <strong>{formatCount(top.messageCount)}</strong> messages. Say hi from us!
    </p>
  );
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
              ? `${formatCount(insights.totalActivities)} activities · people · DMs · searches`
              : "Activity · people · DMs · searches"}
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

    case 3: {
      const rows = baseline.mostLikedCreators;
      const top = rows[0];
      const share = insights?.likesShare;
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Top of your likes"
          title={share?.headline ?? "Most liked creators"}
          deck={share?.subline ?? "Liked posts & comments · by creator"}
          footerStat={top ? mergedFooterStat(top.username, top.count, "likes") : null}
          bodyQuip={top ? likesFooterQuip(top) : null}
        >
          {rows.length > 0 ? (
            <>
              {share?.headline ? <p className={SLIDE_SHARE_HEADLINE}>{share.headline}</p> : null}
              {renderLeaderboardBlock(rows, { accent: getSlideAccent(3) })}
            </>
          ) : (
            <p className={SLIDE_BODY}>No likes counted in this export.</p>
          )}
        </WrappedSlideLayout>
      );
    }

    case 4: {
      const rows = baseline.mostCommentedCreators;
      const top = rows[0];
      const share = insights?.commentsShare;
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Top of your comments"
          title={share?.headline ?? "Most commented creators"}
          deck={share?.subline ?? "Posts, reels & stories"}
          footerStat={top ? mergedFooterStat(top.username, top.count, "comments") : null}
          bodyQuip={top ? commentsFooterQuip(top) : null}
        >
          {rows.length > 0 ? (
            <>
              {share?.headline ? <p className={SLIDE_SHARE_HEADLINE}>{share.headline}</p> : null}
              {renderLeaderboardBlock(rows, { accent: getSlideAccent(4) })}
            </>
          ) : (
            <p className={SLIDE_BODY}>No comments counted in this export.</p>
          )}
        </WrappedSlideLayout>
      );
    }

    case 5: {
      const rows = baseline.mostStoryCreators;
      const top = rows[0];
      const share = insights?.storiesShare;
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Top of your stories"
          title={share?.headline ?? "Top story interactions"}
          deck={share?.subline ?? "Polls · views · reactions"}
          footerStat={top ? mergedFooterStat(top.username, top.count, "interactions") : null}
          bodyQuip={top ? storiesFooterQuip(top) : null}
        >
          {rows.length > 0 ? (
            <>
              {share?.headline ? <p className={SLIDE_SHARE_HEADLINE}>{share.headline}</p> : null}
              {renderLeaderboardBlock(rows, { accent: getSlideAccent(5) })}
            </>
          ) : (
            <p className={SLIDE_BODY}>No story interactions in this export.</p>
          )}
        </WrappedSlideLayout>
      );
    }

    case 6: {
      const rows = baseline.topThreads;
      const top = rows[0];
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Inbox"
          title="Top DM threads"
          deck={`Top ${WRAPPED_THREAD_CARD_LIMIT} by message count`}
          footerStat={
            top
              ? mergedFooterStat(top.label, top.messageCount, "messages", { thread: true })
              : null
          }
          bodyQuip={top ? dmsFooterQuip(top) : null}
        >
          {rows.length > 0 ? (
            renderLeaderboardBlock(rows, { threadLabels: true, accent: getSlideAccent(6) })
          ) : (
            <p className={SLIDE_BODY}>No threads in this export.</p>
          )}
        </WrappedSlideLayout>
      );
    }

    case 7: {
      const topSearch = baseline.profileSearches?.rows?.[0];
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Search history"
          title="Profile searches"
          deck="From profile_searches.json"
          footerStat={
            topSearch ? (
              <>
                @{topSearch.username} · {formatCount(topSearch.count)} searches
              </>
            ) : null
          }
        >
          {!baseline.profileSearches?.fileFound ? (
            <p className={SLIDE_BODY}>No profile_searches.json in this folder.</p>
          ) : baseline.profileSearches.totalSearchEvents === 0 ||
            baseline.profileSearches.rows.length === 0 ? (
            <p className={SLIDE_BODY}>No profile searches in this snapshot.</p>
          ) : (
            <>
              <p className={SLIDE_HERO}>@{baseline.profileSearches.rows[0].username}</p>
              <p className={SLIDE_MEGA_STAT_SM}>{formatCount(baseline.profileSearches.rows[0].count)}</p>
              <p className={SLIDE_MEGA_LABEL}>searches</p>
              {baseline.profileSearches.rows.length > 1 ? (
                <ul className={SEARCH_RANK_REST} aria-label="Other searches">
                  {baseline.profileSearches.rows.slice(1, 4).map((r, i) => (
                    <li key={r.username} className={SEARCH_RANK_ROW}>
                      <span className={SEARCH_RANK_NUM}>{i + 2}</span>
                      <span className={SEARCH_RANK_NAME}>@{r.username}</span>
                      <span className={SEARCH_RANK_COUNT}>{r.count}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </WrappedSlideLayout>
      );
    }

    case 8:
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

    case 9:
      return (
        <WrappedSlideLayout
          template={template}
          eyebrow="Your feed personality"
          title={insights?.personality?.title ?? "Still loading your vibe"}
          deck={insights?.personality?.tagline ?? "Load activity data to see your club"}
          bodyClassName="hero"
          footerStat={
            insights?.personality
              ? `${insights.personality.emoji} ${insights.personality.title}`
              : null
          }
        >
          {insights?.personality ? (
            <>
              <p className={SLIDE_PERSONALITY_EMOJI_HERO} aria-hidden>
                {insights.personality.emoji}
              </p>
              <p className={SLIDE_PERSONALITY_TITLE_HERO}>{insights.personality.title}</p>
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

    default:
      return null;
  }
}
