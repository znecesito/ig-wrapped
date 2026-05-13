import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FolderPicker from "../components/FolderPicker.jsx";
import { useExportData } from "../context/ExportDataContext.jsx";
import { heatColor } from "../utils/commentHeatmap.js";
import {
  formatActivityBreakdownForWrapped,
  loadWrappedBaseline,
  WRAPPED_THREAD_CARD_LIMIT
} from "../utils/wrappedData.js";

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
const WRAPPED_CARD_COUNT = 8;

export default function WrappedPage() {
  const {
    files,
    detectedUsername,
    heatmapCache,
    socialGraphCache,
    messagesCache,
    setHeatmapCache,
    setSocialGraphCache,
    setMessagesCache
  } = useExportData();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [baseline, setBaseline] = useState(null);
  const [warningsOpen, setWarningsOpen] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (!files?.length) {
      setBaseline(null);
      setLoadError("");
      setLoading(false);
      setWarningsOpen(true);
      setCardIndex(0);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setBaseline(null);

    loadWrappedBaseline({
      files,
      detectedUsername,
      heatmapCache,
      socialGraphCache,
      messagesCache,
      setHeatmapCache,
      setSocialGraphCache,
      setMessagesCache
    })
      .then((data) => {
        if (!cancelled) {
          setBaseline(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err?.message || "Something went wrong loading Wrapped.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    files,
    detectedUsername,
    heatmapCache,
    socialGraphCache,
    messagesCache,
    setHeatmapCache,
    setSocialGraphCache,
    setMessagesCache
  ]);

  const scrollToCard = useCallback((nextIndex) => {
    const clamped = Math.max(0, Math.min(WRAPPED_CARD_COUNT - 1, nextIndex));
    setCardIndex(clamped);
    const el = cardRefs.current[clamped];
    if (el && scrollerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return undefined;
    }
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.55)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) {
          const idx = cards.indexOf(visible.target);
          if (idx >= 0) {
            setCardIndex(idx);
          }
        }
      },
      { root, threshold: [0.55, 0.75] }
    );
    for (const c of cards) {
      observer.observe(c);
    }
    return () => observer.disconnect();
  }, [baseline, loading, files]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return undefined;
    }
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) {
      return undefined;
    }
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("wrapped-card--visible");
          }
        }
      },
      { root, threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    for (const c of cards) {
      revealObserver.observe(c);
    }
    return () => revealObserver.disconnect();
  }, [baseline, loading, files]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!files?.length || loading || !baseline) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        scrollToCard(cardIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        scrollToCard(cardIndex - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [files, loading, baseline, cardIndex, scrollToCard]);

  const maxMostLikedCount = useMemo(() => {
    if (!baseline?.mostLikedCreators?.length) {
      return 0;
    }
    return Math.max(...baseline.mostLikedCreators.map((r) => r.count));
  }, [baseline]);

  const maxThreadCount = useMemo(() => {
    if (!baseline?.topThreads?.length) {
      return 0;
    }
    return Math.max(...baseline.topThreads.map((r) => r.messageCount));
  }, [baseline]);

  const activityBreakdown = useMemo(
    () => formatActivityBreakdownForWrapped(baseline?.heatmapData),
    [baseline?.heatmapData]
  );

  const handle = detectedUsername
    ? `@${String(detectedUsername).replace(/^@/, "")}`
    : "your Instagram export";

  if (!files) {
    return (
      <section className="container wrapped-page">
        <h1>Wrapped</h1>
        <p>
          A short story built from the same data as Activity Heatmap, Social Graph, and Messages.
          Choose your full Instagram export folder (unzipped on desktop is the smoothest path).
        </p>
        <div className="card heatmap-controls">
          <FolderPicker />
        </div>
      </section>
    );
  }

  return (
    <section className="container wrapped-page">
      <h1>Wrapped</h1>
      <p className="wrapped-page__lede muted">
        Story cards use your loaded export. Date ranges reflect timestamps found in activity data, not
        everything Instagram has ever stored.
      </p>

      {loadError ? <div className="error">{loadError}</div> : null}

      {loading ? (
        <p className="muted wrapped-page__status" role="status">
          Reading your export…
        </p>
      ) : null}

      {!loading && baseline?.warnings?.length > 0 && warningsOpen ? (
        <div className="card warning-card wrapped-page__warnings" role="status">
          <div className="wrapped-page__warnings-header">
            <h2 className="wrapped-page__warnings-title">Parse warnings</h2>
            <button type="button" className="wrapped-page__dismiss" onClick={() => setWarningsOpen(false)}>
              Dismiss
            </button>
          </div>
          <ul>
            {baseline.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && baseline ? (
        <div className="wrapped-story">
          <div className="wrapped-story__controls">
            <button
              type="button"
              className="wrapped-story__nav-btn"
              onClick={() => scrollToCard(cardIndex - 1)}
              disabled={cardIndex <= 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="wrapped-story__nav-btn"
              onClick={() => scrollToCard(cardIndex + 1)}
              disabled={cardIndex >= WRAPPED_CARD_COUNT - 1}
            >
              Next
            </button>
          </div>

          <div className="wrapped-story__dots" role="tablist" aria-label="Wrapped slides">
            {Array.from({ length: WRAPPED_CARD_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={cardIndex === i}
                className={`wrapped-story__dot ${cardIndex === i ? "is-active" : ""}`}
                onClick={() => scrollToCard(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="wrapped-story__scroller" ref={scrollerRef}>
            <article
              className="wrapped-card card"
              ref={(el) => {
                cardRefs.current[0] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">ig-wrapped</p>
              <h2 className="wrapped-card__title">Your {handle}</h2>
              <p className="wrapped-card__body muted">
                Here&apos;s a quick snapshot from this export. Open other tabs anytime for filters and
                detail.
              </p>
            </article>

            <article
              className="wrapped-card card"
              ref={(el) => {
                cardRefs.current[1] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">In this export</p>
              <h2 className="wrapped-card__title">Your activity span</h2>
              {baseline.heatmapData ? (
                <>
                  <p className="wrapped-card__stat">{baseline.heatmapData.dateRangeLabel}</p>
                  <p className="wrapped-card__body muted">
                    Based on timestamps in your activity data in this export (comments, likes, media,
                    story interactions).
                  </p>
                </>
              ) : (
                <p className="wrapped-card__body muted">
                  No activity timestamps were available from this folder. Try the Activity Heatmap tab
                  for details.
                </p>
              )}
            </article>

            <article
              className="wrapped-card card wrapped-card--activity"
              ref={(el) => {
                cardRefs.current[2] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">Rhythm</p>
              <h2 className="wrapped-card__title">Activity</h2>
              {baseline.heatmapData && baseline.heatmapData.totalActivities > 0 ? (
                <>
                  <p className="wrapped-card__stat wrapped-card__stat--lead">
                    {baseline.heatmapData.totalActivities}{" "}
                    <span className="wrapped-card__stat-note">activities</span>
                  </p>
                  <div className="wrapped-activity-breakdown" aria-label="Activity by main category">
                    {activityBreakdown.families.map((fam) => {
                      const famPct =
                        activityBreakdown.maxFamilyTotal > 0
                          ? (fam.total / activityBreakdown.maxFamilyTotal) * 100
                          : 0;
                      return (
                        <section key={fam.family} className="wrapped-activity-family">
                          <div className="wrapped-activity-family__head">
                            <span
                              className="wrapped-activity-family__label"
                              style={{ borderLeftColor: fam.color }}
                            >
                              {fam.label}
                            </span>
                            <span className="wrapped-activity-family__total">{fam.total}</span>
                          </div>
                          <div className="wrapped-bar-row__track wrapped-activity-family__track" role="presentation">
                            <div
                              className="wrapped-bar-row__fill"
                              style={{
                                width: `${famPct}%`,
                                backgroundColor: fam.color
                              }}
                            />
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  <ul className="wrapped-card__stats wrapped-card__stats--inline">
                    <li>
                      <span className="wrapped-card__label">Busiest weekday</span>
                      <span className="wrapped-card__value">{baseline.heatmapData.activeWeekdayLabel}</span>
                    </li>
                    <li>
                      <span className="wrapped-card__label">Busiest hour</span>
                      <span className="wrapped-card__value">{baseline.heatmapData.activeHourLabel}</span>
                    </li>
                  </ul>
                </>
              ) : (
                <p className="wrapped-card__body muted">
                  Nothing to show yet—activity JSON may be missing or empty in this export.
                </p>
              )}
            </article>

            <article
              className="wrapped-card card wrapped-card--liked"
              ref={(el) => {
                cardRefs.current[3] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">Hearts</p>
              <h2 className="wrapped-card__title">Your most liked creators</h2>
              <p className="wrapped-card__body muted">
                From liked posts and liked comments in this export, rolled up by whose content you
                hearted.
              </p>
              {baseline.mostLikedCreators.length > 0 ? (
                <ul className="wrapped-card__bars" aria-label="Most liked creators">
                  {baseline.mostLikedCreators.map((row, index) => {
                    const widthPct =
                      maxMostLikedCount > 0 ? (row.count / maxMostLikedCount) * 100 : 0;
                    const fillColor = heatColor(row.count, maxMostLikedCount);
                    const profileUrl = `${IG_PROFILE_BASE_URL}${encodeURIComponent(row.username)}/`;
                    return (
                      <li key={row.username} className="wrapped-bar-row">
                        <div className="wrapped-bar-row__header">
                          <a
                            className="wrapped-bar-row__name"
                            href={profileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {row.username}
                          </a>
                          <span className="wrapped-bar-row__rank" aria-hidden>
                            #{index + 1}
                          </span>
                          <span className="wrapped-bar-row__count">{row.count}</span>
                        </div>
                        <div className="wrapped-bar-row__track" role="presentation">
                          <div
                            className="wrapped-bar-row__fill"
                            style={{ width: `${widthPct}%`, backgroundColor: fillColor }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="wrapped-card__body muted">
                  No like interactions were counted for this export (or Social Graph data wasn&apos;t
                  loaded yet).
                </p>
              )}
              {baseline.mostLikedCreators.length > 0 ? (
                <p className="wrapped-card__footer">
                  Rent&apos;s due on your attention span —{" "}
                  <a
                    className="wrapped-card__footer-link"
                    href={`${IG_PROFILE_BASE_URL}${encodeURIComponent(baseline.mostLikedCreators[0].username)}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{String(baseline.mostLikedCreators[0].username).replace(/^@/, "")}
                  </a>{" "}
                  earned <strong>{baseline.mostLikedCreators[0].count}</strong> of your likes here.
                  The algorithm simply watches.
                </p>
              ) : null}
            </article>

            <article
              className="wrapped-card card"
              ref={(el) => {
                cardRefs.current[4] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">Inbox</p>
              <h2 className="wrapped-card__title">Top DM threads</h2>
              <p className="wrapped-card__body muted">
                Top {WRAPPED_THREAD_CARD_LIMIT} by message count (same ranking as Messages; export shows
                up to {baseline.messagesTopN} threads there).
              </p>
              {baseline.topThreads.length > 0 ? (
                <ul className="wrapped-card__bars" aria-label="Top DM threads">
                  {baseline.topThreads.map((row, index) => {
                    const widthPct =
                      maxThreadCount > 0 ? (row.messageCount / maxThreadCount) * 100 : 0;
                    const fillColor = heatColor(row.messageCount, maxThreadCount);
                    return (
                      <li key={row.threadKey} className="wrapped-bar-row">
                        <div className="wrapped-bar-row__header">
                          <span className="wrapped-bar-row__name wrapped-bar-row__name--thread" title={row.label}>
                            {row.label}
                          </span>
                          <span className="wrapped-bar-row__rank" aria-hidden>
                            #{index + 1}
                          </span>
                          <span className="wrapped-bar-row__count">{row.messageCount}</span>
                        </div>
                        <div className="wrapped-bar-row__track" role="presentation">
                          <div
                            className="wrapped-bar-row__fill"
                            style={{ width: `${widthPct}%`, backgroundColor: fillColor }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="wrapped-card__body muted">No message threads were counted in this export.</p>
              )}
              {baseline.topThreads.length > 0 ? (
                <p className="wrapped-card__footer">
                  You traded the most messages with{" "}
                  <strong>{formatPrimaryDmThreadName(baseline.topThreads[0].label)}</strong> —{" "}
                  <strong>{baseline.topThreads[0].messageCount}</strong> messages. Say hi from us!
                </p>
              ) : null}
            </article>

            <article
              className="wrapped-card card"
              ref={(el) => {
                cardRefs.current[5] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">Search history</p>
              <h2 className="wrapped-card__title">Profile searches</h2>
              {!baseline.profileSearches?.fileFound ? (
                <p className="wrapped-card__body muted">
                  No <code className="wrapped-page__code">profile_searches.json</code> found under{" "}
                  <code className="wrapped-page__code">logged_information/recent_searches</code> in this
                  folder.
                </p>
              ) : baseline.profileSearches.totalSearchEvents === 0 ||
                baseline.profileSearches.rows.length === 0 ? (
                <p className="wrapped-card__body muted">
                  No profile searches in this export snapshot (or only your own handle).
                </p>
              ) : (
                <>
                  <p className="wrapped-card__body">
                    You searched for{" "}
                    <strong>@{baseline.profileSearches.rows[0].username}</strong>{" "}
                    <strong>{baseline.profileSearches.rows[0].count}</strong> times — your secret&apos;s safe
                    with us.
                  </p>
                  {baseline.profileSearches.rows.length > 1 ? (
                    <ul className="wrapped-card__mini-list muted" aria-label="Other top profile searches">
                      {baseline.profileSearches.rows.slice(1).map((r) => (
                        <li key={r.username}>
                          @{r.username} — {r.count}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </article>

            <article
              className="wrapped-card card"
              ref={(el) => {
                cardRefs.current[6] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">Privacy</p>
              <h2 className="wrapped-card__title">Local only</h2>
              <p className="wrapped-card__body">
                Wrapped runs in your browser. Your export is not uploaded for this view (Non-Followers is
                the only tab that sends files to the server). Clear data from the nav when you&apos;re
                done on a shared device.
              </p>
            </article>

            <article
              className="wrapped-card card wrapped-card--teaser"
              ref={(el) => {
                cardRefs.current[7] = el;
              }}
            >
              <p className="wrapped-card__eyebrow">Coming later</p>
              <h2 className="wrapped-card__title">Creator insights</h2>
              <p className="wrapped-card__body muted">
                If your export includes{' '}
                <code className="wrapped-page__code">logged_information/past_instagram_insights</code>, a
                future pass could surface highlights here.
              </p>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}
