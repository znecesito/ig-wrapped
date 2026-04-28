import React, { useMemo, useState } from "react";
import {
  buildHeatmapData,
  discoverCommentFiles,
  getAvailableTimezones,
  heatColor,
  parseCommentTimestamps
} from "../utils/commentHeatmap.js";

function WeekdayHourHeatmap({ data }) {
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
              <div
                key={`${label}-${hour}`}
                className="weekday-cell"
                title={`${label} ${String(hour).padStart(2, "0")}:00 - ${count} comments`}
                style={{ backgroundColor: heatColor(count, maxCount) }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function CalendarHeatmap({ data }) {
  const maxCount = Math.max(0, ...data.calendarDays.map((item) => item.count));

  return (
    <section className="card heatmap-card">
      <h2>Calendar Intensity</h2>
      <div className="calendar-grid">
        {data.calendarDays.map((item) => (
          <div
            key={item.dateKey}
            className="calendar-cell"
            title={`${item.dateKey}: ${item.count} comments`}
            style={{ backgroundColor: heatColor(item.count, maxCount) }}
          >
            <span>{item.dateKey.slice(-2)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HeatmapPage() {
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [status, setStatus] = useState("Select your exported folder to build a comment heatmap.");
  const [validationError, setValidationError] = useState("");
  const [parseWarnings, setParseWarnings] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [rawTimestamps, setRawTimestamps] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);

  const timezoneOptions = useMemo(() => getAvailableTimezones(), []);

  async function handleFolderPick(event) {
    const files = event.target.files;
    setValidationError("");
    setParseWarnings([]);
    setHeatmapData(null);
    setRawTimestamps([]);
    setDebugInfo(null);

    const discovery = discoverCommentFiles(files);
    setStatus(
      `Scanned ${discovery.allFiles.length} file(s), found ${discovery.commentFiles.length} file(s) under your_instagram_activity/comments, parse targets: ${discovery.parseTargetFiles.length}.`
    );
    setDebugInfo({
      matchedCommentFiles: discovery.commentFilePaths,
      parseTargets: discovery.parseTargetFiles.map((file) => file.webkitRelativePath || file.name),
      parserStats: {
        filesParsed: 0,
        commentsSeen: 0,
        validTimestamps: 0,
        skippedComments: 0
      }
    });

    if (discovery.commentFiles.length === 0) {
      setValidationError(
        "Missing your_instagram_activity/comments in selected folder. Please choose the root export folder."
      );
      return;
    }

    if (!discovery.hypeFile && discovery.postCommentFiles.length === 0) {
      setValidationError("No comment files found. Expected hype.json or post_comments_*.json.");
      return;
    }

    const parseResult = await parseCommentTimestamps(discovery);
    setParseWarnings(parseResult.errors);
    setDebugInfo((current) => ({
      ...(current || {}),
      parserStats: parseResult.stats
    }));

    if (parseResult.timestampsMs.length === 0) {
      setValidationError("No valid comment timestamps were parsed from the selected files.");
      return;
    }

    setRawTimestamps(parseResult.timestampsMs);
    setHeatmapData(buildHeatmapData(parseResult.timestampsMs, timezone));
  }

  function handleTimezoneChange(nextTimezone) {
    setTimezone(nextTimezone);
    if (rawTimestamps.length > 0) {
      setHeatmapData(buildHeatmapData(rawTimestamps, nextTimezone));
    }
  }

  return (
    <section className="container heatmap-page">
      <h1>Instagram Comment Heatmap</h1>
      <p>Upload your export folder to visualize comment activity by weekday/hour and by calendar day.</p>

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
          <p className="muted">Files selected for parsing:</p>
          <ul className="mono-list">
            {debugInfo.parseTargets.map((filePath) => (
              <li key={`target-${filePath}`}>{filePath}</li>
            ))}
          </ul>
          <p className="muted">
            Parsed files: {debugInfo.parserStats?.filesParsed || 0} | Comments seen:{" "}
            {debugInfo.parserStats?.commentsSeen || 0} | Valid timestamps:{" "}
            {debugInfo.parserStats?.validTimestamps || 0} | Skipped comments:{" "}
            {debugInfo.parserStats?.skippedComments || 0}
          </p>
        </div>
      ) : null}

      {heatmapData ? (
        <>
          <section className="summary-grid">
            <div className="card summary-card">
              <span className="summary-label">Total comments</span>
              <strong>{heatmapData.totalComments}</strong>
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
            <span>Less</span>
            <div className="heat-legend__bar" />
            <span>More</span>
          </div>

          <WeekdayHourHeatmap data={heatmapData} />
          <CalendarHeatmap data={heatmapData} />
        </>
      ) : null}
    </section>
  );
}
