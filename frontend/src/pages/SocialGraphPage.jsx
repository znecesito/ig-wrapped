import React, { useMemo, useState } from "react";
import { heatColor } from "../utils/commentHeatmap.js";
import {
  buildTopInteractions,
  discoverSocialInteractionFiles,
  getEffectiveSelfUsername,
  getSocialCategories,
  getSocialSources,
  parsePersonalInformationUsername,
  parseSocialInteractionCounts
} from "../utils/socialInteractionGraph.js";

const IG_PROFILE_BASE_URL = "https://www.instagram.com/";

export default function SocialGraphPage() {
  const sources = useMemo(() => getSocialSources(), []);
  const categories = useMemo(() => getSocialCategories(), []);
  const defaultSourceIds = useMemo(() => sources.map((s) => s.id), [sources]);

  const [status, setStatus] = useState("Select your exported folder to see top accounts you interact with.");
  const [validationError, setValidationError] = useState("");
  const [parseErrors, setParseErrors] = useState([]);
  const [countsBySource, setCountsBySource] = useState(null);
  const [parseStats, setParseStats] = useState(null);
  const [enabledSourceIds, setEnabledSourceIds] = useState(defaultSourceIds);

  const [pickedFiles, setPickedFiles] = useState(null);
  const [detectedUsername, setDetectedUsername] = useState(null);
  const [manualUsername, setManualUsername] = useState("");

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

  async function handleFolderPick(event) {
    const files = event.target.files;
    const fileArray = Array.from(files || []);

    setValidationError("");
    setParseErrors([]);
    setCountsBySource(null);
    setParseStats(null);
    setEnabledSourceIds(defaultSourceIds);
    setManualUsername("");
    setDetectedUsername(null);
    setPickedFiles(fileArray.length ? fileArray : null);
    setStatus("Reading your export folder…");

    const pi = await parsePersonalInformationUsername(fileArray);
    setDetectedUsername(pi.username);

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
        "No comment JSON found under your_instagram_activity/comments (e.g. post_comments_*.json, hype.json)."
      );
      return;
    }

    const self = getEffectiveSelfUsername(pi.username, "");
    const result = await parseSocialInteractionCounts(discovery, { selfUsername: self });

    if (result.stats.itemsSeen === 0) {
      setStatus("Select your exported folder to see top accounts you interact with.");
      setValidationError("No rows found in the selected comment JSON files.");
      return;
    }

    if (result.stats.skippedMissingOwner === result.stats.itemsSeen) {
      setStatus("Select your exported folder to see top accounts you interact with.");
      setValidationError(
        "No Media Owner usernames were found in the selected comment files. Check that your export format matches."
      );
      return;
    }

    setParseErrors(result.errors);
    setParseStats(result.stats);
    setCountsBySource(result.countsBySource);
    setStatus("");
  }

  async function handleManualUsernameBlur() {
    if (!pickedFiles?.length) {
      return;
    }
    const discovery = discoverSocialInteractionFiles(pickedFiles);
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
    setStatus("");
  }

  function updateEnabledSources(nextSourceIds) {
    setEnabledSourceIds(nextSourceIds);
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

  const commentsAccent = "#4f46e5";
  const skippedSelf = parseStats?.skippedSelfAccount ?? 0;

  return (
    <section className="container social-graph-page">
      <h1>Social graph</h1>
      <p>
        Select your full Instagram data export folder (the one that contains both{" "}
        <code className="social-graph-page__code">your_instagram_activity</code> and{" "}
        <code className="social-graph-page__code">personal_information</code>) so we can find your
        comments and detect your username to exclude interactions on your own posts and reels.
      </p>

      <div className="card heatmap-controls">
        <label>
          Upload export folder
          <input
            type="file"
            directory=""
            webkitdirectory=""
            multiple
            onChange={handleFolderPick}
          />
        </label>
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
                exclude comments on your own content; otherwise those replies may appear in the chart.
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
                {parseStats.countedInteractions} comment interaction(s) counted toward other
                accounts&rsquo; media (from {parseStats.filesParsed} file(s)). Toggle sources to change
                the chart.
                {parseStats.skippedMissingOwner > 0
                  ? ` ${parseStats.skippedMissingOwner} row(s) skipped (no Media Owner).`
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
                with a Media Owner was treated as your own account, or turn on more comment sources.
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
                  style={{ "--family-accent": commentsAccent }}
                  onClick={() => handleCategoryToggle(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="activity-filters__row activity-filters__row--nested">
              <span className="muted social-graph-page__subheading">Comment sources</span>
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`chip chip--family ${enabledSourceIds.includes(source.id) ? "is-active" : ""}`}
                  style={{ "--family-accent": commentsAccent }}
                  onClick={() => handleSourceToggle(source.id)}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card social-graph-chart">
            <h2>Top accounts you interact with</h2>
            <p className="muted">Ranked by comment interactions (enabled sources merged).</p>

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
