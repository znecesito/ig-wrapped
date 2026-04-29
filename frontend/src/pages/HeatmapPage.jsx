import React, { useMemo, useState } from "react";
import {
  activityCellColor,
  buildHeatmapData,
  discoverActivityFiles,
  getActivityFamilyLegend,
  getActivitySources,
  getAvailableTimezones,
  parseActivityEvents
} from "../utils/commentHeatmap.js";

function WeekdayHourHeatmap({ data, colorMode }) {
  const maxCount = Math.max(0, ...data.weekdayHourCounts.flat());

  return (
    <section className="card heatmap-card">
      <h2>Weekday x Hour Pattern</h2>
      <p className="muted">Hover cells for exact counts.</p>
      <div className="weekday-grid">
        <div className="weekday-grid__header-spacer" />
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={`h-${hour}`} className="weekday-grid__hour-label">
            {hour}
          </div>
        ))}

        {data.weekdayLabels.map((label, dayIndex) => (
          <React.Fragment key={label}>
            <div className="weekday-grid__day-label">{label}</div>
            {data.weekdayHourCounts[dayIndex].map((count, hour) => (
              // Detail buckets let us color by dominant family in breakdown mode.
              <div
                key={`${label}-${hour}`}
                className="weekday-cell"
                title={`${label} ${String(hour).padStart(2, "0")}:00 - ${count} activities`}
                style={{
                  backgroundColor: activityCellColor({
                    count,
                    maxCount,
                    mode: colorMode,
                    dominantFamily: data.weekdayHourDetails[dayIndex][hour].dominantFamily
                  })
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function CalendarHeatmap({ data, colorMode }) {
  const maxCount = Math.max(0, ...data.calendarDays.map((item) => item.count));

  return (
    <section className="card heatmap-card">
      <h2>Calendar Intensity</h2>
      <div className="calendar-grid">
        {data.calendarDays.map((item) => (
          <div
            key={item.dateKey}
            className="calendar-cell"
            title={`${item.dateKey}: ${item.count} activities`}
            style={{
              backgroundColor: activityCellColor({
                count: item.count,
                maxCount,
                mode: colorMode,
                dominantFamily: item.dominantFamily
              })
            }}
          >
            <span>{item.dateKey.slice(-2)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HeatmapPage() {
  const sources = useMemo(() => getActivitySources(), []);
  const defaultSourceIds = useMemo(() => sources.map((source) => source.id), [sources]);
  const familyLegend = useMemo(() => getActivityFamilyLegend(), []);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [status, setStatus] = useState("Select your exported folder to build an activity heatmap.");
  const [validationError, setValidationError] = useState("");
  const [parseWarnings, setParseWarnings] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [rawEvents, setRawEvents] = useState([]);
  const [enabledSourceIds, setEnabledSourceIds] = useState(defaultSourceIds);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [colorMode, setColorMode] = useState("intensity");
  const [debugInfo, setDebugInfo] = useState(null);

  const timezoneOptions = useMemo(() => getAvailableTimezones(), []);

  async function handleFolderPick(event) {
    const files = event.target.files;
    setValidationError("");
    setParseWarnings([]);
    setHeatmapData(null);
    setRawEvents([]);
    setEnabledSourceIds(defaultSourceIds);
    setDebugInfo(null);

    const discovery = discoverActivityFiles(files);
    setStatus(
      `Scanned ${discovery.allFiles.length} file(s), found ${discovery.activityFiles.length} file(s) under your_instagram_activity, parse targets: ${discovery.parseTargetFiles.length}.`
    );
    setDebugInfo({
      matchedCommentFiles: discovery.matchedFilesByFolder.comments.map(
        (file) => file.webkitRelativePath || file.name
      ),
      matchedLikeFiles: discovery.matchedFilesByFolder.likes.map(
        (file) => file.webkitRelativePath || file.name
      ),
      parseTargets: discovery.parseTargetPaths,
      parserStats: {
        filesParsed: 0,
        itemsSeen: 0,
        validTimestamps: 0,
        skippedItems: 0
      }
    });

    if (discovery.activityFiles.length === 0) {
      setValidationError(
        "Missing your_instagram_activity in selected folder. Please choose the root export folder."
      );
      return;
    }

    if (discovery.parseTargetFiles.length === 0) {
      setValidationError(
        "No supported activity files found. Expected hype.json, post_comments_*.json, liked_comments.json, or liked_posts.json."
      );
      return;
    }

    const parseResult = await parseActivityEvents(discovery);
    setParseWarnings(parseResult.errors);
    setDebugInfo((current) => ({
      ...(current || {}),
      parserStats: parseResult.stats.total
    }));

    if (parseResult.events.length === 0) {
      setValidationError("No valid activity timestamps were parsed from the selected files.");
      return;
    }

    setRawEvents(parseResult.events);
    setHeatmapData(
      buildHeatmapData(parseResult.events, timezone, {
        enabledSourceIds: defaultSourceIds
      })
    );
  }

  function handleTimezoneChange(nextTimezone) {
    setTimezone(nextTimezone);
    if (rawEvents.length > 0) {
      setHeatmapData(
        buildHeatmapData(rawEvents, nextTimezone, {
          enabledSourceIds
        })
      );
    }
  }

  function updateEnabledSources(nextSourceIds) {
    setEnabledSourceIds(nextSourceIds);
    if (rawEvents.length > 0) {
      setHeatmapData(
        buildHeatmapData(rawEvents, timezone, {
          enabledSourceIds: nextSourceIds
        })
      );
    }
  }

  function handleFamilyToggle(family) {
    const familySourceIds = sources
      .filter((source) => source.family === family)
      .map((source) => source.id);
    const allEnabled = familySourceIds.every((sourceId) => enabledSourceIds.includes(sourceId));
    const next = allEnabled
      ? enabledSourceIds.filter((sourceId) => !familySourceIds.includes(sourceId))
      : Array.from(new Set([...enabledSourceIds, ...familySourceIds]));
    updateEnabledSources(next);
  }

  function handleSourceToggle(sourceId) {
    const isEnabled = enabledSourceIds.includes(sourceId);
    const next = isEnabled
      ? enabledSourceIds.filter((id) => id !== sourceId)
      : [...enabledSourceIds, sourceId];
    updateEnabledSources(next);
  }

  function isFamilyEnabled(family) {
    const familySourceIds = sources
      .filter((source) => source.family === family)
      .map((source) => source.id);
    return familySourceIds.every((sourceId) => enabledSourceIds.includes(sourceId));
  }

  return (
    <section className="container heatmap-page">
      <h1>Instagram Activity Heatmap</h1>
      <p>
        Upload your export folder to visualize comments and likes by weekday/hour and by calendar
        day.
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

        <label>
          Timezone
          <select value={timezone} onChange={(event) => handleTimezoneChange(event.target.value)}>
            {timezoneOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <p className="muted">{status}</p>
      </div>

      {validationError ? <div className="error">{validationError}</div> : null}

      {parseWarnings.length > 0 ? (
        <div className="card warning-card">
          <h2>Parse warnings</h2>
          <ul>
            {parseWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {debugInfo ? (
        <div className="card debug-card">
          <h2>File discovery details</h2>
          <p className="muted">Matched in comments folder:</p>
          <ul className="mono-list">
            {debugInfo.matchedCommentFiles.map((filePath) => (
              <li key={`matched-${filePath}`}>{filePath}</li>
            ))}
          </ul>
          <p className="muted">Matched in likes folder:</p>
          <ul className="mono-list">
            {debugInfo.matchedLikeFiles.map((filePath) => (
              <li key={`likes-${filePath}`}>{filePath}</li>
            ))}
          </ul>
          <p className="muted">Files selected for parsing:</p>
          <ul className="mono-list">
            {debugInfo.parseTargets.map((filePath) => (
              <li key={`target-${filePath}`}>{filePath}</li>
            ))}
          </ul>
          <p className="muted">
            Parsed files: {debugInfo.parserStats?.filesParsed || 0} | Items seen:{" "}
            {debugInfo.parserStats?.itemsSeen || 0} | Valid timestamps:{" "}
            {debugInfo.parserStats?.validTimestamps || 0} | Skipped items:{" "}
            {debugInfo.parserStats?.skippedItems || 0}
          </p>
        </div>
      ) : null}

      {heatmapData ? (
        <>
          <section className="card activity-filters">
            <div className="activity-filters__row">
              <button
                type="button"
                className={`chip ${enabledSourceIds.length === sources.length ? "is-active" : ""}`}
                onClick={() => updateEnabledSources(defaultSourceIds)}
              >
                All
              </button>
              <button
                type="button"
                className={`chip ${isFamilyEnabled("comments") ? "is-active" : ""}`}
                onClick={() => handleFamilyToggle("comments")}
              >
                Comments
              </button>
              <button
                type="button"
                className={`chip ${isFamilyEnabled("likes") ? "is-active" : ""}`}
                onClick={() => handleFamilyToggle("likes")}
              >
                Likes
              </button>
              <button
                type="button"
                className="chip chip-muted"
                onClick={() => setShowAdvancedFilters((value) => !value)}
              >
                {showAdvancedFilters ? "Hide details" : "Advanced filters"}
              </button>
            </div>
            {showAdvancedFilters ? (
              <div className="activity-filters__row">
                {sources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    className={`chip ${enabledSourceIds.includes(source.id) ? "is-active" : ""}`}
                    onClick={() => handleSourceToggle(source.id)}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="activity-filters__row">
              <span className="muted">Color mode</span>
              <button
                type="button"
                className={`chip ${colorMode === "intensity" ? "is-active" : ""}`}
                onClick={() => setColorMode("intensity")}
              >
                Intensity
              </button>
              <button
                type="button"
                className={`chip ${colorMode === "breakdown" ? "is-active" : ""}`}
                onClick={() => setColorMode("breakdown")}
              >
                Breakdown
              </button>
            </div>
          </section>

          <section className="summary-grid">
            <div className="card summary-card">
              <span className="summary-label">Total activity</span>
              <strong>{heatmapData.totalActivities}</strong>
            </div>
            <div className="card summary-card">
              <span className="summary-label">Most active day</span>
              <strong>{heatmapData.activeWeekdayLabel}</strong>
            </div>
            <div className="card summary-card">
              <span className="summary-label">Most active hour</span>
              <strong>{heatmapData.activeHourLabel}</strong>
            </div>
            <div className="card summary-card">
              <span className="summary-label">Date range</span>
              <strong>{heatmapData.dateRangeLabel}</strong>
            </div>
          </section>

          <div className="heat-legend card">
            {colorMode === "intensity" ? (
              <>
                <span>Less</span>
                <div className="heat-legend__bar" />
                <span>More</span>
              </>
            ) : (
              <>
                <span>Breakdown</span>
                <div className="family-legend">
                  {familyLegend.map((item) => (
                    <span key={item.family} className="family-legend__item">
                      <span
                        className="family-legend__dot"
                        style={{ backgroundColor: item.color }}
                        aria-hidden
                      />
                      {item.family}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <WeekdayHourHeatmap data={heatmapData} colorMode={colorMode} />
          <CalendarHeatmap data={heatmapData} colorMode={colorMode} />
        </>
      ) : null}
    </section>
  );
}
