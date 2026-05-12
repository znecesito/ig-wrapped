import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FolderPicker from "../components/FolderPicker.jsx";
import { useExportData } from "../context/ExportDataContext.jsx";
import {
  ACTIVITY_FAMILY_COLORS,
  activityCellColor,
  buildCalendarMonthGrids,
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

const CALENDAR_WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarHeatmap({ data, colorMode }) {
  const monthGrids = useMemo(() => buildCalendarMonthGrids(data), [data]);
  const maxCount = useMemo(() => {
    let max = 0;
    for (const month of monthGrids) {
      for (const week of month.weeks) {
        for (const cell of week) {
          if (cell.type === "day" && cell.count > max) {
            max = cell.count;
          }
        }
      }
    }
    return max;
  }, [monthGrids]);

  if (monthGrids.length === 0) {
    return (
      <section className="card heatmap-card">
        <h2>Activity calendar</h2>
        <p className="muted">No date range to show for the current filters.</p>
      </section>
    );
  }

  return (
    <section className="card heatmap-card">
      <h2>Activity calendar</h2>
      <p className="muted">
        Each month shows every day in your activity range (lighter days had no events). Week starts
        on Sunday.
      </p>
      <div className="calendar-year">
        {monthGrids.map((month) => (
          <div key={month.monthId} className="calendar-month">
            <h3 className="calendar-month__title">{month.title}</h3>
            <div className="calendar-month__weekdays">
              {CALENDAR_WEEKDAY_HEADERS.map((label) => (
                <div key={label} className="calendar-month__weekday">
                  {label}
                </div>
              ))}
            </div>
            <div className="calendar-month__grid">
              {month.weeks.flatMap((week, wi) =>
                week.map((cell, di) => {
                  const key = `${month.monthId}-${wi}-${di}`;
                  if (cell.type === "empty") {
                    return <div key={key} className="calendar-day calendar-day--empty" aria-hidden />;
                  }
                  const title = `${cell.dateKey}: ${cell.count} activities`;
                  return (
                    <div
                      key={key}
                      className={`calendar-day ${cell.count === 0 ? "calendar-day--zero" : ""}`}
                      title={title}
                      style={{
                        backgroundColor: activityCellColor({
                          count: cell.count,
                          maxCount: maxCount || 1,
                          mode: colorMode,
                          dominantFamily: cell.dominantFamily
                        })
                      }}
                    >
                      <span className="calendar-day__num">{cell.dayNumber}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HeatmapPage() {
  const { files, heatmapCache, setHeatmapCache } = useExportData();
  const sources = useMemo(() => getActivitySources(), []);
  const defaultSourceIds = useMemo(() => sources.map((source) => source.id), [sources]);
  const familyLegend = useMemo(() => getActivityFamilyLegend(), []);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [status, setStatus] = useState(
    heatmapCache ? "" : "Select your exported folder to build an activity heatmap."
  );
  const [validationError, setValidationError] = useState("");
  const [parseWarnings, setParseWarnings] = useState(heatmapCache?.parseWarnings ?? []);
  const [heatmapData, setHeatmapData] = useState(heatmapCache?.heatmapData ?? null);
  const [rawEvents, setRawEvents] = useState(heatmapCache?.rawEvents ?? []);
  const [enabledSourceIds, setEnabledSourceIds] = useState(
    heatmapCache?.enabledSourceIds ?? defaultSourceIds
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [colorMode, setColorMode] = useState("intensity");
  const parsedFilesRef = useRef(heatmapCache ? files : null);

  const timezoneOptions = useMemo(() => getAvailableTimezones(), []);

  const parseFiles = useCallback(
    async (fileArray) => {
      if (parsedFilesRef.current === fileArray) {
        return;
      }
      parsedFilesRef.current = fileArray;

      setValidationError("");
      setParseWarnings([]);
      setHeatmapData(null);
      setRawEvents([]);
      setEnabledSourceIds(defaultSourceIds);
      setStatus("Reading your export folder…");

      const discovery = discoverActivityFiles(fileArray);

      console.info("[heatmap] discovery", {
        scannedFiles: discovery.allFiles.length,
        activityFolderFiles: discovery.activityFiles.length,
        parseTargets: discovery.parseTargetPaths,
        commentsFolderMatches: discovery.matchedFilesByFolder.comments.map(
          (f) => f.webkitRelativePath || f.name
        ),
        likesFolderMatches: discovery.matchedFilesByFolder.likes.map(
          (f) => f.webkitRelativePath || f.name
        ),
        mediaFolderMatches: discovery.matchedFilesByFolder.media.map(
          (f) => f.webkitRelativePath || f.name
        ),
        storyInteractionsFolderMatches: discovery.matchedFilesByFolder.story_interactions.map(
          (f) => f.webkitRelativePath || f.name
        )
      });

      if (discovery.activityFiles.length === 0) {
        setStatus("Select your exported folder to build an activity heatmap.");
        setValidationError(
          "Missing your_instagram_activity in selected folder. Please choose the root export folder."
        );
        return;
      }

      if (discovery.parseTargetFiles.length === 0) {
        setStatus("Select your exported folder to build an activity heatmap.");
        setValidationError(
          "No supported activity files found. Expected activity JSON under your_instagram_activity (e.g. comments, likes, media, or story_interactions: polls.json, stories_viewed.json, story_likes.json)."
        );
        return;
      }

      const parseResult = await parseActivityEvents(discovery);
      setParseWarnings(parseResult.errors);

      console.info("[heatmap] parse", {
        errors: parseResult.errors,
        statsTotal: parseResult.stats.total,
        statsBySource: parseResult.stats.bySource,
        eventCount: parseResult.events.length
      });

      if (parseResult.events.length === 0) {
        setStatus("Select your exported folder to build an activity heatmap.");
        setValidationError("No valid activity timestamps were parsed from the selected files.");
        return;
      }

      const hd = buildHeatmapData(parseResult.events, timezone, {
        enabledSourceIds: defaultSourceIds
      });
      setRawEvents(parseResult.events);
      setHeatmapData(hd);
      setHeatmapCache({
        rawEvents: parseResult.events,
        heatmapData: hd,
        enabledSourceIds: defaultSourceIds,
        parseWarnings: parseResult.errors
      });
      setStatus("");
    },
    [defaultSourceIds, timezone, setHeatmapCache]
  );

  useEffect(() => {
    if (files && !heatmapCache) {
      parseFiles(files);
    }
  }, [files, heatmapCache, parseFiles]);

  function handleTimezoneChange(nextTimezone) {
    setTimezone(nextTimezone);
    if (rawEvents.length > 0) {
      const hd = buildHeatmapData(rawEvents, nextTimezone, { enabledSourceIds });
      setHeatmapData(hd);
      setHeatmapCache({ rawEvents, heatmapData: hd, enabledSourceIds, parseWarnings });
    }
  }

  function updateEnabledSources(nextSourceIds) {
    setEnabledSourceIds(nextSourceIds);
    if (rawEvents.length > 0) {
      const hd = buildHeatmapData(rawEvents, timezone, { enabledSourceIds: nextSourceIds });
      setHeatmapData(hd);
      setHeatmapCache({ rawEvents, heatmapData: hd, enabledSourceIds: nextSourceIds, parseWarnings });
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
        Upload your export folder to visualize comments, likes, media, and story interactions by
        weekday/hour and by calendar day.
      </p>

      <div className="card heatmap-controls">
        <FolderPicker onFilesReady={parseFiles} />

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

        {status ? <p className="muted heatmap-controls__status">{status}</p> : null}
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

      {heatmapData ? (
        <>
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
              <strong className="upload-success__title">You&apos;re all set</strong>
              <p className="upload-success__text muted">
                Your export was read successfully and activity is shown below. Use filters to focus
                on comments, likes, media, or story interactions.
              </p>
            </div>
          </div>

          <section className="card activity-filters">
            <div className="activity-filters__row">
              <button
                type="button"
                className={`chip ${enabledSourceIds.length === sources.length ? "is-active" : ""}`}
                onClick={() => updateEnabledSources(defaultSourceIds)}
              >
                All
              </button>
              {familyLegend.map(({ family, label, color }) => (
                <button
                  key={family}
                  type="button"
                  className={`chip chip--family ${isFamilyEnabled(family) ? "is-active" : ""}`}
                  style={{ "--family-accent": color }}
                  onClick={() => handleFamilyToggle(family)}
                >
                  {label}
                </button>
              ))}
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
                    className={`chip chip--family ${enabledSourceIds.includes(source.id) ? "is-active" : ""}`}
                    style={{ "--family-accent": ACTIVITY_FAMILY_COLORS[source.family] }}
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
                      {item.label}
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
