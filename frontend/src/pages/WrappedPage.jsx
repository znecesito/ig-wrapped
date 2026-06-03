import React, { useCallback, useEffect, useMemo, useState } from "react";
import ExportGuide from "../components/ExportGuide.jsx";
import ExportPicker from "../components/ExportPicker.jsx";
import WrappedLobby from "../components/WrappedLobby.jsx";
import WrappedStoryPlayer from "../components/WrappedStoryPlayer.jsx";
import { useExportData } from "../context/ExportDataContext.jsx";
import { useWrappedPlayer } from "../context/WrappedPlayerContext.jsx";
import { WRAPPED_CARD_COUNT } from "../config/wrappedPlayer.js";
import {
  formatActivityBreakdownForWrapped,
  loadWrappedBaseline
} from "../utils/wrappedData.js";
import { buildWrappedInsights } from "../utils/wrappedInsights.js";
import { PAGE_TITLE, WRAPPED_PAGE_LEDE, WRAPPED_PAGE_STATUS } from "../components/wrappedSlideClasses.js";
import { renderWrappedSlide } from "./wrappedSlideContent.jsx";
import {
  startWrappedPlaylist,
  stopWrappedPlaylist
} from "../utils/wrappedAudio.js";

export { WRAPPED_CARD_COUNT };

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

  const { isPlayerActive, setPlayerActive } = useWrappedPlayer();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [baseline, setBaseline] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    if (!files?.length) {
      setBaseline(null);
      setLoadError("");
      setLoading(false);
      setCardIndex(0);
      setPlayerActive(false);
      stopWrappedPlaylist();
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setBaseline(null);
    setPlayerActive(false);
    setCardIndex(0);

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
    setMessagesCache,
    setPlayerActive
  ]);

  useEffect(() => {
    if (!isPlayerActive) {
      document.body.style.overflow = "";
      return undefined;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPlayerActive]);

  const activityBreakdown = useMemo(
    () => formatActivityBreakdownForWrapped(baseline?.heatmapData),
    [baseline?.heatmapData]
  );

  const insights = useMemo(() => buildWrappedInsights(baseline), [baseline]);

  const handle = detectedUsername
    ? `@${String(detectedUsername).replace(/^@/, "")}`
    : "your Instagram export";

  const slideCtx = useMemo(
    () => ({
      baseline,
      handle,
      activityBreakdown,
      insights
    }),
    [baseline, handle, activityBreakdown, insights]
  );

  const handleStart = useCallback(() => {
    startWrappedPlaylist();
    setCardIndex(0);
    setPlayerActive(true);
  }, [setPlayerActive]);

  const handleExitPlayer = useCallback(() => {
    stopWrappedPlaylist();
    setPlayerActive(false);
    setCardIndex(0);
  }, [setPlayerActive]);

  const renderSlide = useCallback(
    (index) => renderWrappedSlide(index, slideCtx),
    [slideCtx]
  );

  if (!files) {
    return (
      <section className="container wrapped-page">
        <h1 className={PAGE_TITLE}>Wrapped</h1>
        <p className={WRAPPED_PAGE_LEDE}>
          Your Instagram year in story cards — private, in your browser. Load your export below.
        </p>
        <ExportGuide />
        <div className="card export-picker-card">
          <h2 className="export-picker-card__title">Load your export</h2>
          <ExportPicker />
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="container wrapped-page">
        <h1 className={PAGE_TITLE}>Wrapped</h1>
        <p className={WRAPPED_PAGE_STATUS} role="status">
          Reading your export…
        </p>
      </section>
    );
  }

  if (!baseline) {
    return (
      <section className="container wrapped-page">
        <h1 className={PAGE_TITLE}>Wrapped</h1>
        {loadError ? <div className="error">{loadError}</div> : null}
      </section>
    );
  }

  return (
    <>
      {!isPlayerActive ? (
        <WrappedLobby
          handle={handle}
          insights={insights}
          warnings={baseline.warnings}
          loadError={loadError}
          onStart={handleStart}
        />
      ) : null}

      {isPlayerActive ? (
        <WrappedStoryPlayer
          cardIndex={cardIndex}
          cardCount={WRAPPED_CARD_COUNT}
          onIndexChange={setCardIndex}
          onExit={handleExitPlayer}
          renderSlide={renderSlide}
        />
      ) : null}
    </>
  );
}
