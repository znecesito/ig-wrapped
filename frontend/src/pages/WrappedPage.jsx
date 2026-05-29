import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExportGuide from "../components/ExportGuide.jsx";
import ExportPicker from "../components/ExportPicker.jsx";
import { WrappedSlideShell } from "../components/WrappedSlideChrome.jsx";
import WrappedStoryDeck from "../components/WrappedStoryDeck.jsx";
import { useExportData } from "../context/ExportDataContext.jsx";
import {
  formatActivityBreakdownForWrapped,
  loadWrappedBaseline
} from "../utils/wrappedData.js";
import { buildWrappedInsights } from "../utils/wrappedInsights.js";
import { getSlideTheme } from "../utils/wrappedThemes.js";
import {
  PAGE_TITLE,
  WRAPPED_PAGE_DISMISS,
  WRAPPED_PAGE_LEDE,
  WRAPPED_PAGE_STATUS,
  WRAPPED_PAGE_WARNINGS_HEADER,
  WRAPPED_PAGE_WARNINGS_TITLE
} from "../components/wrappedSlideClasses.js";
import { renderWrappedSlide } from "./wrappedSlideContent.jsx";

const WRAPPED_CARD_COUNT = 10;

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
  const prevIndexRef = useRef(0);

  useEffect(() => {
    if (!files?.length) {
      setBaseline(null);
      setLoadError("");
      setLoading(false);
      setWarningsOpen(true);
      setCardIndex(0);
      prevIndexRef.current = 0;
      cardRefs.current = [];
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

  const goToCard = useCallback((nextIndex) => {
    const clamped = Math.max(0, Math.min(WRAPPED_CARD_COUNT - 1, nextIndex));
    if (clamped === prevIndexRef.current) {
      return;
    }
    const direction = clamped > prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = clamped;
    setCardIndex(clamped);

    const el = cardRefs.current[clamped];
    if (el) {
      el.classList.remove("wrapped-card--from-next", "wrapped-card--from-prev");
      el.classList.add(direction > 0 ? "wrapped-card--from-next" : "wrapped-card--from-prev");
      el.classList.add("wrapped-card--visible");
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !baseline) {
      return undefined;
    }
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) {
      return undefined;
    }

    // Cards default to opacity 0 until revealed; ensure at least one is visible on load.
    cards[0]?.classList.add("wrapped-card--visible");

    const indexObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.55)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) {
          const idx = cards.indexOf(visible.target);
          if (idx >= 0) {
            setCardIndex(idx);
            prevIndexRef.current = idx;
          }
        }
      },
      { root, threshold: [0.55, 0.75] }
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("wrapped-card--visible");
          }
        }
      },
      { root, threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
    );

    for (const c of cards) {
      indexObserver.observe(c);
      revealObserver.observe(c);
    }
    return () => {
      indexObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [baseline, loading, files]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!files?.length || loading || !baseline) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goToCard(cardIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToCard(cardIndex - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [files, loading, baseline, cardIndex, goToCard]);

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

  return (
    <section className="container wrapped-page">
      <h1 className={PAGE_TITLE}>Wrapped</h1>
      <p className={WRAPPED_PAGE_LEDE}>
        Story cards use your loaded export. Scroll vertically through slides, or use Prev/Next. Date
        ranges reflect timestamps found in activity data.
      </p>

      {loadError ? <div className="error">{loadError}</div> : null}

      {loading ? (
        <p className={WRAPPED_PAGE_STATUS} role="status">
          Reading your export…
        </p>
      ) : null}

      {!loading && baseline?.warnings?.length > 0 && warningsOpen ? (
        <div className="card warning-card wrapped-page__warnings" role="status">
          <div className={WRAPPED_PAGE_WARNINGS_HEADER}>
            <h2 className={WRAPPED_PAGE_WARNINGS_TITLE}>Parse warnings</h2>
            <button type="button" className={WRAPPED_PAGE_DISMISS} onClick={() => setWarningsOpen(false)}>
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
        <WrappedStoryDeck
          cardIndex={cardIndex}
          cardCount={WRAPPED_CARD_COUNT}
          onPrevious={() => goToCard(cardIndex - 1)}
          onNext={() => goToCard(cardIndex + 1)}
          onGoToIndex={goToCard}
          scrollerRef={scrollerRef}
          viewportLabel={`Slide ${cardIndex + 1} of ${WRAPPED_CARD_COUNT}`}
        >
          {Array.from({ length: WRAPPED_CARD_COUNT }).map((_, i) => (
            <WrappedSlideShell
              key={i}
              cardIndex={i}
              cardCount={WRAPPED_CARD_COUNT}
              theme={getSlideTheme(i)}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
            >
              {renderWrappedSlide(i, slideCtx)}
            </WrappedSlideShell>
          ))}
        </WrappedStoryDeck>
      ) : null}
    </section>
  );
}
