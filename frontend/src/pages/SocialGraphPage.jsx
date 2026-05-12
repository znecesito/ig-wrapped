import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FolderPicker from "../components/FolderPicker.jsx";
import { useExportData } from "../context/ExportDataContext.jsx";
import { ACTIVITY_FAMILY_COLORS, heatColor } from "../utils/commentHeatmap.js";
import {
  buildTopInteractions,
  discoverSocialInteractionFiles,
  getEffectiveSelfUsername,
  getSocialCategories,
  getSocialSources,
  parseSocialInteractionCounts
} from "../utils/socialInteractionGraph.js";

const IG_PROFILE_BASE_URL = "https://www.instagram.com/";

export default function SocialGraphPage() {
  const {
    files,
    detectedUsername,
    socialGraphCache,
    setSocialGraphCache
  } = useExportData();
  const sources = useMemo(() => getSocialSources(), []);
  const categories = useMemo(() => getSocialCategories(), []);
  const defaultSourceIds = useMemo(() => sources.map((s) => s.id), [sources]);

  const [status, setStatus] = useState(
    socialGraphCache ? "" : "Select your exported folder to see top accounts you interact with."
  );
  const [validationError, setValidationError] = useState("");
  const [parseErrors, setParseErrors] = useState(socialGraphCache?.parseErrors ?? []);
  const [countsBySource, setCountsBySource] = useState(socialGraphCache?.countsBySource ?? null);
  const [parseStats, setParseStats] = useState(socialGraphCache?.parseStats ?? null);
  const [enabledSourceIds, setEnabledSourceIds] = useState(
    socialGraphCache?.enabledSourceIds ?? defaultSourceIds
  );

  const [manualUsername, setManualUsername] = useState("");
  const parsedFilesRef = useRef(socialGraphCache ? files : null);

  const effectiveSelfUsername = useMemo(
    () => getEffectiveSelfUsername(detectedUsername, manualUsername),
    [detectedUsername, manualUsername]
  );

  const topRows = useMemo(() => {
    if (!countsBySource) {
      return [];
    }
    return buildTopInteractions(countsBySource, enabledSourceIds, 5);
  }, [countsBySource, enabledSourceIds]);

  const maxBarCount = useMemo(() => {
    if (topRows.length === 0) {
      return 0;
    }
    return Math.max(...topRows.map((r) => r.count));
  }, [topRows]);

  const showGraphUi =
    countsBySource != null &&
    parseStats != null &&
    parseStats.itemsSeen > 0 &&
    parseStats.skippedMissingOwner < parseStats.itemsSeen;

  const parseFiles = useCallback(
    async (fileArray) => {
      if (parsedFilesRef.current === fileArray) {
        return;
      }
      parsedFilesRef.current = fileArray;

      setValidationError("");
      setParseErrors([]);
      setCountsBySource(null);
      setParseStats(null);
      setEnabledSourceIds(defaultSourceIds);
      setManualUsername("");
      setStatus("Reading your export folder…");

      const discovery = discoverSocialInteractionFiles(fileArray);

      if (discovery.activityFiles.length === 0) {
        setStatus("Select your exported folder to see top accounts you interact with.");
        setValidationError(
          "Missing your_instagram_activity in selected folder. Please choose the root Instagram export folder."
        );
        return;
      }

      if (discovery.parseTargetFiles.length === 0) {
        setStatus("Select your exported folder to see top accounts you interact with.");
        setValidationError(
          "No matching activity JSON under your_instagram_activity. Expected files under comments (e.g. post_comments_*.json, hype.json), likes (liked_posts.json, liked_comments.json), or story_interactions (polls.json, stories_viewed.json or stories_view.json, story_likes.json)."
        );
        return;
      }

      const self = getEffectiveSelfUsername(detectedUsername, "");
      const result = await parseSocialInteractionCounts(discovery, { selfUsername: self });

      if (result.stats.itemsSeen === 0) {
        setStatus("Select your exported folder to see top accounts you interact with.");
        setValidationError("No rows found in the selected activity JSON files.");
        return;
      }

      if (result.stats.skippedMissingOwner === result.stats.itemsSeen) {
        setStatus("Select your exported folder to see top accounts you interact with.");
        setValidationError(
          "No account usernames could be extracted from the selected files. Check that your export format matches."
        );
        return;
      }

      setParseErrors(result.errors);
      setParseStats(result.stats);
      setCountsBySource(result.countsBySource);
      setSocialGraphCache({
        countsBySource: result.countsBySource,
        parseStats: result.stats,
        parseErrors: result.errors,
        enabledSourceIds: defaultSourceIds
      });
      setStatus("");
    },
    [defaultSourceIds, detectedUsername, setSocialGraphCache]
  );

  useEffect(() => {
    if (files && !socialGraphCache) {
      parseFiles(files);
    }
  }, [files, socialGraphCache, parseFiles]);

  async function handleManualUsernameBlur() {
    if (!files?.length) {
      return;
    }
    const discovery = discoverSocialInteractionFiles(files);
    if (discovery.parseTargetFiles.length === 0) {
      return;
    }

    setStatus("Updating rankings…");
    const self = getEffectiveSelfUsername(detectedUsername, manualUsername);
    const result = await parseSocialInteractionCounts(discovery, { selfUsername: self });

    if (result.stats.itemsSeen === 0) {
      setStatus("");
      return;
    }

    setParseErrors(result.errors);
    setParseStats(result.stats);
    setCountsBySource(result.countsBySource);
    setSocialGraphCache({
      countsBySource: result.countsBySource,
      parseStats: result.stats,
      parseErrors: result.errors,
      enabledSourceIds
    });
    setStatus("");
  }

  function updateEnabledSources(nextSourceIds) {
    setEnabledSourceIds(nextSourceIds);
    if (countsBySource) {
      setSocialGraphCache((prev) => prev ? { ...prev, enabledSourceIds: nextSourceIds } : prev);
    }
  }

  function handleSelectAllSources() {
    updateEnabledSources(defaultSourceIds);
  }

  function handleCategoryToggle(categoryId) {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) {
      return;
    }
    const allOn = cat.sourceIds.every((id) => enabledSourceIds.includes(id));
    const next = allOn
      ? enabledSourceIds.filter((id) => !cat.sourceIds.includes(id))
      : Array.from(new Set([...enabledSourceIds, ...cat.sourceIds]));
    updateEnabledSources(next);
  }

  function handleSourceToggle(sourceId) {
    const isEnabled = enabledSourceIds.includes(sourceId);
    const next = isEnabled
      ? enabledSourceIds.filter((id) => id !== sourceId)
      : [...enabledSourceIds, sourceId];
    updateEnabledSources(next);
  }

  function isCategoryFullyEnabled(categoryId) {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || cat.sourceIds.length === 0) {
      return false;
    }
    return cat.sourceIds.every((id) => enabledSourceIds.includes(id));
  }

  const categoryAccent = (categoryId) =>
    ACTIVITY_FAMILY_COLORS[categoryId] ?? ACTIVITY_FAMILY_COLORS.comments ?? "#4f46e5";
  const skippedSelf = parseStats?.skippedSelfAccount ?? 0;

  return (
    <section className="container social-graph-page">
      <h1>Social graph</h1>
      <p>
        Select your full Instagram data export folder (the one that contains both{" "}
        <code className="social-graph-page__code">your_instagram_activity</code> and{" "}
        <code className="social-graph-page__code">personal_information</code>) so we can load your
        comments, likes, and story interactions, and detect your username to exclude interactions with
        your own account.
      </p>

      <div className="card heatmap-controls">
        <FolderPicker onFilesReady={parseFiles} />
        {status ? <p className="muted heatmap-controls__status">{status}</p> : null}
      </div>

      {validationError ? <div className="error">{validationError}</div> : null}

      {parseErrors.length > 0 ? (
        <div className="card warning-card">
          <h2>Parse warnings</h2>
          <ul>
            {parseErrors.map((msg, i) => (
              <li key={`${i}-${msg}`}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {showGraphUi ? (
        <>
          {detectedUsername ? (
            <div className="card social-graph-identity" role="status">
              <p className="social-graph-identity__detected">
                We have detected your username is &lsquo;
                <strong>{detectedUsername}</strong>&rsquo;.
              </p>
            </div>
          ) : null}

          <div className="card social-graph-username-field">
            <label className="social-graph-username-field__label">
              Your Instagram username (override if detection is wrong; leading @ is optional)
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder={detectedUsername ? "Leave blank to use detected username" : "e.g. your_handle"}
                value={manualUsername}
                onChange={(e) => setManualUsername(e.target.value)}
                onBlur={handleManualUsernameBlur}
              />
            </label>
            {!effectiveSelfUsername ? (
              <p className="social-graph-hint--warn">
                We couldn&apos;t read your username from personal_information.json. Enter it above to
                exclude interactions with your own account; otherwise those may appear in the chart.
              </p>
            ) : null}
          </div>

          <div className="upload-success card" role="status">
            <div className="upload-success__icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8.5 12.5L11 15L16 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <strong className="upload-success__title">Data loaded</strong>
              <p className="upload-success__text muted">
                {parseStats.countedInteractions} interaction(s) counted toward other accounts&rsquo;
                content (from {parseStats.filesParsed} file(s)). Toggle sources to change the chart.
                {parseStats.skippedMissingOwner > 0
                  ? ` ${parseStats.skippedMissingOwner} row(s) skipped (no target username).`
                  : ""}
                {skippedSelf > 0
                  ? ` ${skippedSelf} interaction(s) on your own content excluded.`
                  : ""}
              </p>
            </div>
          </div>

          {parseStats.countedInteractions === 0 ? (
            <div className="card social-graph-empty-banner">
              <p>
                No interactions on other people&apos;s content matched your filters. Every parsed row
                may have been attributed to your own account, or try enabling more sources.
              </p>
            </div>
          ) : null}

          <section className="card activity-filters">
            <div className="activity-filters__row">
              <button
                type="button"
                className={`chip ${enabledSourceIds.length === sources.length ? "is-active" : ""}`}
                onClick={handleSelectAllSources}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`chip chip--family ${isCategoryFullyEnabled(cat.id) ? "is-active" : ""}`}
                  style={{ "--family-accent": categoryAccent(cat.id) }}
                  onClick={() => handleCategoryToggle(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="activity-filters__row activity-filters__row--nested">
              <span className="muted social-graph-page__subheading">Sources</span>
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`chip chip--family ${enabledSourceIds.includes(source.id) ? "is-active" : ""}`}
                  style={{ "--family-accent": categoryAccent(source.categoryId) }}
                  onClick={() => handleSourceToggle(source.id)}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card social-graph-chart">
            <h2>Top accounts you interact with</h2>
            <p className="muted">Ranked by interactions (enabled sources merged).</p>

            {topRows.length === 0 ? (
              <p className="muted social-graph-chart__empty">Enable at least one source to see results.</p>
            ) : (
              <ul className="social-graph-bars" aria-label="Top accounts by interactions">
                {topRows.map((row, index) => {
                  const widthPct = maxBarCount > 0 ? (row.count / maxBarCount) * 100 : 0;
                  const fillColor = heatColor(row.count, maxBarCount);
                  const profileUrl = `${IG_PROFILE_BASE_URL}${encodeURIComponent(row.username)}/`;

                  return (
                    <li key={row.username} className="social-graph-bar-row">
                      <div className="social-graph-bar-row__header">
                        <a
                          className="social-graph-bar-row__name"
                          href={profileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.username}
                        </a>
                        <span className="social-graph-bar-row__rank" aria-hidden>
                          #{index + 1}
                        </span>
                        <span className="social-graph-bar-row__count">{row.count}</span>
                      </div>
                      <div className="social-graph-bar-row__track" role="presentation">
                        <div
                          className="social-graph-bar-row__fill"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: fillColor
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
