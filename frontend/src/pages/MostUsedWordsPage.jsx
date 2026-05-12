import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FolderPicker from "../components/FolderPicker.jsx";
import { useExportData } from "../context/ExportDataContext.jsx";
import { heatColor } from "../utils/commentHeatmap.js";
import {
  analyzeMostUsedWordsFromFiles,
  discoverMostUsedWordsMediaFiles
} from "../utils/mostUsedWords.js";

const IG_TAG_BASE_URL = "https://www.instagram.com/explore/tags/";

export default function MostUsedWordsPage() {
  const { files, wordsCache, setWordsCache } = useExportData();

  const [status, setStatus] = useState(
    wordsCache ? "" : "Select your exported folder to analyze captions from posts, reels, stories, and archived posts."
  );
  const [validationError, setValidationError] = useState("");
  const [pickedFiles, setPickedFiles] = useState(wordsCache?.pickedFiles ?? null);
  const [topN, setTopN] = useState(wordsCache?.topN ?? 5);
  const [minWordLength, setMinWordLength] = useState(wordsCache?.minWordLength ?? 2);
  const [result, setResult] = useState(wordsCache?.result ?? null);
  const parsedFilesRef = useRef(wordsCache ? files : null);

  useEffect(() => {
    if (!pickedFiles?.length) {
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("Analyzing captions…");
      const analysis = await analyzeMostUsedWordsFromFiles(pickedFiles, {
        topN,
        minWordLength
      });
      if (cancelled) {
        return;
      }
      if (analysis.stats.captionsParsed === 0) {
        setValidationError(
          "No captions with text were found in the expected media files. Empty titles only will not contribute."
        );
        setResult(null);
        setWordsCache(null);
        setStatus(
          "Select your exported folder to analyze captions from posts, reels, stories, and archived posts."
        );
        return;
      }
      setValidationError("");
      setResult(analysis);
      setWordsCache({ result: analysis, pickedFiles, topN, minWordLength });
      setStatus("");
    })();
    return () => {
      cancelled = true;
    };
  }, [pickedFiles, topN, minWordLength, setWordsCache]);

  const parseFiles = useCallback(
    (fileArray) => {
      if (parsedFilesRef.current === fileArray) {
        return;
      }
      parsedFilesRef.current = fileArray;

      setValidationError("");
      setResult(null);
      setPickedFiles(null);

      if (!fileArray?.length) {
        setStatus(
          "Select your exported folder to analyze captions from posts, reels, stories, and archived posts."
        );
        return;
      }

      setStatus("Reading media captions from your export…");

      const discovery = discoverMostUsedWordsMediaFiles(fileArray);

      if (discovery.activityFiles.length === 0) {
        setStatus(
          "Select your exported folder to analyze captions from posts, reels, stories, and archived posts."
        );
        setValidationError(
          "Missing your_instagram_activity in selected folder. Please choose the root Instagram export folder."
        );
        return;
      }

      if (discovery.parseTargetFiles.length === 0) {
        setStatus(
          "Select your exported folder to analyze captions from posts, reels, stories, and archived posts."
        );
        setValidationError(
          "No caption JSON found under your_instagram_activity/media. Expected posts_*.json, archived_posts.json, reels.json, and/or stories.json."
        );
        return;
      }

      setPickedFiles(fileArray);
    },
    []
  );

  useEffect(() => {
    if (files && !wordsCache) {
      parseFiles(files);
    }
  }, [files, wordsCache, parseFiles]);

  const maxWordCount = useMemo(() => {
    if (!result?.topWords?.length) {
      return 0;
    }
    return Math.max(...result.topWords.map((r) => r.count));
  }, [result]);

  const maxTagCount = useMemo(() => {
    if (!result?.topHashtags?.length) {
      return 0;
    }
    return Math.max(...result.topHashtags.map((r) => r.count));
  }, [result]);

  const showResults = result != null && result.stats.captionsParsed > 0;

  return (
    <section className="container most-used-words-page">
      <h1>Most used words</h1>
      <p>
        Select your full Instagram data export folder (the one that contains{" "}
        <code className="most-used-words-page__code">your_instagram_activity</code>). We read
        captions from{" "}
        <code className="most-used-words-page__code">your_instagram_activity/media</code> — posts,
        archived posts, reels, and stories — entirely in your browser.
      </p>

      <div className="card heatmap-controls">
        <FolderPicker onFilesReady={parseFiles} />
        {status ? <p className="muted heatmap-controls__status">{status}</p> : null}
      </div>

      {validationError ? <div className="error">{validationError}</div> : null}

      {result?.warnings?.length ? (
        <div className="card warning-card">
          <h2>Notes</h2>
          <ul>
            {result.warnings.map((msg, i) => (
              <li key={`${i}-${msg}`}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {showResults ? (
        <>
          <div className="card most-used-words-controls">
            <p className="muted most-used-words-controls__label">Rankings</p>
            <div className="most-used-words-controls__row">
              <span className="muted most-used-words-controls__hint">Top</span>
              {[5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`chip ${topN === n ? "is-active" : ""}`}
                  onClick={() => setTopN(n)}
                >
                  {n}
                </button>
              ))}
              <span className="muted most-used-words-controls__hint">Min. word length</span>
              {[2, 3].map((n) => (
                <button
                  key={`len-${n}`}
                  type="button"
                  className={`chip ${minWordLength === n ? "is-active" : ""}`}
                  onClick={() => setMinWordLength(n)}
                >
                  {n}
                </button>
              ))}
            </div>
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
              <strong className="upload-success__title">Captions analyzed</strong>
              <p className="upload-success__text muted">
                Parsed {result.stats.captionsParsed} caption(s) from {result.stats.filesParsed}{" "}
                file(s). {result.stats.tokensFiltered} token(s) filtered (stopwords or below minimum
                length).
              </p>
              <div className="most-used-words-chips" aria-label="Summary counts">
                <span className="chip chip--readonly">Captions: {result.stats.captionsParsed}</span>
                <span className="chip chip--readonly">Unique words: {result.stats.uniqueWords}</span>
                <span className="chip chip--readonly">Unique hashtags: {result.stats.uniqueHashtags}</span>
                <span className="chip chip--readonly">Tokens counted: {result.stats.tokensCounted}</span>
              </div>
            </div>
          </div>

          <section className="card social-graph-chart">
            <h2>Top words</h2>
            <p className="muted">Meaningful words only (English stopwords removed).</p>
            {result.topWords.length === 0 ? (
              <p className="muted social-graph-chart__empty">No words matched the current filters.</p>
            ) : (
              <ul className="social-graph-bars" aria-label="Top words by frequency">
                {result.topWords.map((row, index) => {
                  const widthPct = maxWordCount > 0 ? (row.count / maxWordCount) * 100 : 0;
                  const fillColor = heatColor(row.count, maxWordCount);
                  return (
                    <li key={row.word} className="social-graph-bar-row">
                      <div className="social-graph-bar-row__header">
                        <span className="social-graph-bar-row__name">{row.word}</span>
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

          <section className="card social-graph-chart">
            <h2>Top hashtags</h2>
            <p className="muted">Counted separately from plain words; links open Instagram tag search.</p>
            {result.topHashtags.length === 0 ? (
              <p className="muted social-graph-chart__empty">No hashtags in your captions.</p>
            ) : (
              <ul className="social-graph-bars" aria-label="Top hashtags by frequency">
                {result.topHashtags.map((row, index) => {
                  const widthPct = maxTagCount > 0 ? (row.count / maxTagCount) * 100 : 0;
                  const fillColor = heatColor(row.count, maxTagCount);
                  const href = `${IG_TAG_BASE_URL}${encodeURIComponent(row.tag)}/`;

                  return (
                    <li key={row.tag} className="social-graph-bar-row">
                      <div className="social-graph-bar-row__header">
                        <a className="social-graph-bar-row__name" href={href} target="_blank" rel="noreferrer">
                          {row.display}
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
