import React, { useMemo, useState } from "react";
import { heatColor } from "../utils/commentHeatmap.js";
import {
  discoverMessageThreads,
  MESSAGE_FREQUENCY_TOP_N,
  parseAndAggregateThreads,
  relabelMessageThreadRows
} from "../utils/messageFrequency.js";
import {
  getEffectiveSelfUsername,
  parsePersonalInformationUsername
} from "../utils/socialInteractionGraph.js";

export default function MessagesPage() {
  const [status, setStatus] = useState(
    "Select your exported folder to see message totals per DM thread."
  );
  const [validationError, setValidationError] = useState("");
  const [parseWarnings, setParseWarnings] = useState([]);
  const [rows, setRows] = useState(null);
  const [stats, setStats] = useState(null);
  const [threadBuckets, setThreadBuckets] = useState(null);

  const [pickedFiles, setPickedFiles] = useState(null);
  const [detectedUsername, setDetectedUsername] = useState(null);
  const [manualUsername, setManualUsername] = useState("");

  const effectiveSelfUsername = useMemo(
    () => getEffectiveSelfUsername(detectedUsername, manualUsername),
    [detectedUsername, manualUsername]
  );

  const topRows = useMemo(() => {
    if (!rows?.length) {
      return [];
    }
    return rows.slice(0, MESSAGE_FREQUENCY_TOP_N);
  }, [rows]);

  const maxBarCount = useMemo(() => {
    if (topRows.length === 0) {
      return 0;
    }
    return Math.max(...topRows.map((r) => r.messageCount));
  }, [topRows]);

  const showChartUi = stats != null && stats.threadsWithMessages > 0 && rows != null;

  async function handleFolderPick(event) {
    const files = event.target.files;
    const fileArray = Array.from(files || []);

    setValidationError("");
    setParseWarnings([]);
    setRows(null);
    setStats(null);
    setThreadBuckets(null);
    setManualUsername("");
    setDetectedUsername(null);
    setPickedFiles(fileArray.length ? fileArray : null);
    setStatus("Reading your export folder…");

    const pi = await parsePersonalInformationUsername(fileArray);
    setDetectedUsername(pi.username);

    const discovery = discoverMessageThreads(fileArray);

    if (discovery.activityFiles.length === 0) {
      setStatus("Select your exported folder to see message totals per DM thread.");
      setValidationError(
        "Missing your_instagram_activity in selected folder. Choose the Instagram export root (the folder that contains your_instagram_activity)."
      );
      return;
    }

    if (discovery.inboxMessageFiles.length === 0) {
      setStatus("Select your exported folder to see message totals per DM thread.");
      setValidationError(
        "No message JSON files found. Expected paths like your_instagram_activity/messages/inbox/&lt;thread&gt;/message_*.json."
      );
      return;
    }

    const self = getEffectiveSelfUsername(pi.username, "");
    const parsed = await parseAndAggregateThreads(discovery.threadBuckets, {
      selfUsername: self
    });

    setParseWarnings(parsed.warnings);

    if (parsed.stats.threadsWithMessages === 0) {
      setStatus("Select your exported folder to see message totals per DM thread.");
      setValidationError(
        parsed.stats.filesSkipped > 0
          ? "Message files were present but none could be read (missing messages arrays or invalid JSON). See warnings below."
          : "No messages were counted in any thread."
      );
      setStats(parsed.stats);
      return;
    }

    setThreadBuckets(discovery.threadBuckets);
    setRows(parsed.rows);
    setStats(parsed.stats);
    setStatus("");
  }

  async function handleManualUsernameBlur() {
    if (!pickedFiles?.length || !threadBuckets || !rows?.length) {
      return;
    }

    setStatus("Updating labels…");
    const self = getEffectiveSelfUsername(detectedUsername, manualUsername);
    const nextRows = await relabelMessageThreadRows(rows, threadBuckets, {
      selfUsername: self
    });
    setRows(nextRows);
    setStatus("");
  }

  return (
    <section className="container messages-page">
      <h1>Message frequency</h1>
      <p>
        Select your full Instagram export folder root (the one that contains{" "}
        <code className="messages-page__code">your_instagram_activity</code>
        ). Rankings are <strong>per thread</strong> (each inbox subfolder); totals include all
        messages in that thread (sent and received). Labels come from export metadata and may not
        match current @handles — profile links are omitted.
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

      {parseWarnings.length > 0 ? (
        <div className="card warning-card">
          <h2>Parse warnings</h2>
          <ul>
            {parseWarnings.map((msg, i) => (
              <li key={`${i}-${msg}`}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {showChartUi ? (
        <>
          {detectedUsername ? (
            <div className="card social-graph-identity" role="status">
              <p className="social-graph-identity__detected">
                We have detected your username is &lsquo;
                <strong>{detectedUsername}</strong>&rsquo;. This helps label 1:1 threads as the other
                person when the export lists participants.
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
                We couldn&apos;t read your username from personal_information.json. Enter it above so
                1:1 threads can be labeled with the other participant when possible; otherwise folder
                names from the export are used.
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
                {stats.totalMessages.toLocaleString()} message(s) across {stats.threadsWithMessages}{" "}
                thread(s) ({stats.filesParsed} file(s) read).
                {stats.filesSkipped > 0
                  ? ` ${stats.filesSkipped} file(s) skipped (see warnings).`
                  : ""}
              </p>
            </div>
          </div>

          <section className="card social-graph-chart">
            <h2>Top threads by message count</h2>
            <p className="muted">
              Showing top {MESSAGE_FREQUENCY_TOP_N} threads by total messages (merged across{" "}
              <code className="messages-page__code">message_*.json</code> parts).
            </p>

            <ul className="social-graph-bars" aria-label="Top DM threads by message count">
              {topRows.map((row, index) => {
                const widthPct = maxBarCount > 0 ? (row.messageCount / maxBarCount) * 100 : 0;
                const fillColor = heatColor(row.messageCount, maxBarCount);

                return (
                  <li key={row.threadKey} className="social-graph-bar-row">
                    <div className="social-graph-bar-row__header">
                      <span
                        className="social-graph-bar-row__name messages-page__thread-label"
                        title={row.label}
                      >
                        {row.label}
                      </span>
                      <span className="social-graph-bar-row__rank" aria-hidden>
                        #{index + 1}
                      </span>
                      <span className="social-graph-bar-row__count">{row.messageCount}</span>
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
          </section>
        </>
      ) : null}
    </section>
  );
}
