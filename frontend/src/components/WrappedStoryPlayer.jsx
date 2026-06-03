import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/utils.js";
import { WrappedPlayerSlide } from "./WrappedSlideChrome.jsx";
import {
  getCardSurfaceStyle,
  getSlideTheme,
  getSlideThemeStyle,
  getSlideTemplate
} from "../utils/wrappedThemes.js";
import {
  getSlideAnimDurationMs,
  WRAPPED_AUTO_ADVANCE,
  WRAPPED_CARD_COUNT,
  WRAPPED_LAST_SLIDE_INDEX
} from "../config/wrappedPlayer.js";
import {
  createSlideBeatTimeline,
  killSlideTimeline
} from "../utils/wrappedSlideTimeline.js";
import WrappedSlideErrorBoundary from "./WrappedSlideErrorBoundary.jsx";
import WrappedMusicPlayer from "./WrappedMusicPlayer.jsx";
import {
  pauseWrappedAudioForHold,
  resumeWrappedAudioFromHold
} from "../utils/wrappedAudio.js";

const TAP_MAX_MS = 280;
/** Delay before hold-to-pause kicks in — quick taps skip this and keep audio playing. */
const HOLD_PAUSE_MS = 220;

/**
 * Full-screen story player: progress segments, tap nav, hold-to-pause, tap-to-advance.
 */
export default function WrappedStoryPlayer({
  cardIndex,
  cardCount = WRAPPED_CARD_COUNT,
  onIndexChange,
  onExit,
  renderSlide,
  getTheme = getSlideTheme
}) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideRef = useRef(null);
  const pointerRef = useRef(null);
  const swipeRef = useRef(null);
  const holdTimerRef = useRef(null);
  const rafRef = useRef(null);
  const timelineRef = useRef(null);

  const isLastSlide = cardIndex >= WRAPPED_LAST_SLIDE_INDEX;
  const autoAdvance = WRAPPED_AUTO_ADVANCE && !isLastSlide;
  const animDurationMs = getSlideAnimDurationMs(cardIndex);
  const slideTheme = getTheme(cardIndex);
  const slideThemeStyle = getSlideThemeStyle(slideTheme);
  const slideTemplate = getSlideTemplate(cardIndex);
  const surfaceStyle = getCardSurfaceStyle(slideTheme, slideTemplate, { playerMode: true });
  const { background: slideBackground, ...slideSurfaceVars } = surfaceStyle;
  const isHeroTemplate = slideTemplate === "hero";

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (nextIndex) => {
      const clamped = Math.max(0, Math.min(cardCount - 1, nextIndex));
      if (clamped === cardIndex) {
        return;
      }
      onIndexChange(clamped);
      resumeWrappedAudioFromHold();
    },
    [cardCount, cardIndex, onIndexChange]
  );

  const goNext = useCallback(() => {
    if (cardIndex < cardCount - 1) {
      goTo(cardIndex + 1);
    }
  }, [cardCount, cardIndex, goTo]);

  const goPrev = useCallback(() => {
    if (cardIndex > 0) {
      goTo(cardIndex - 1);
    }
  }, [cardIndex, goTo]);

  useEffect(() => {
    setProgress(0);
    setPaused(false);
    clearHoldTimer();
    resumeWrappedAudioFromHold();
  }, [cardIndex, clearHoldTimer]);

  useLayoutEffect(() => {
    const root = slideRef.current;
    if (!root) {
      return undefined;
    }

    let cancelled = false;
    let tl = null;

    const startTimeline = () => {
      if (cancelled) {
        return;
      }

      killSlideTimeline(timelineRef.current);
      timelineRef.current = null;

      try {
        tl = createSlideBeatTimeline(root, {
          slideIndex: cardIndex,
          durationMs: animDurationMs,
          template: slideTemplate,
          onComplete: () => {
            if (autoAdvance) {
              goNext();
            }
          }
        });
      } catch (err) {
        console.error("[wrapped] Slide timeline failed:", err);
        tl = null;
      }

      timelineRef.current = tl;

      if (tl) {
        tl.play(0);
      }
    };

    const raf = requestAnimationFrame(startTimeline);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      killSlideTimeline(tl);
      if (timelineRef.current === tl) {
        timelineRef.current = null;
      }
    };
  }, [cardIndex, autoAdvance, animDurationMs, goNext, slideTemplate]);

  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) {
      return;
    }
    if (paused) {
      tl.pause();
      pauseWrappedAudioForHold();
    } else {
      tl.play();
      resumeWrappedAudioFromHold();
    }
  }, [paused]);

  useEffect(() => {
    const tick = () => {
      const tl = timelineRef.current;
      if (tl) {
        setProgress(tl.progress());
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [cardIndex]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onExit]);

  useEffect(() => () => clearHoldTimer(), [clearHoldTimer]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) {
      return;
    }
    pointerRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now()
    };
    swipeRef.current = { y0: e.clientY };
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      setPaused(true);
    }, HOLD_PAUSE_MS);
  };

  const handlePointerUp = (e) => {
    const down = pointerRef.current;
    pointerRef.current = null;
    clearHoldTimer();

    if (paused) {
      setPaused(false);
      resumeWrappedAudioFromHold();
    }

    if (!down) {
      return;
    }

    const dt = Date.now() - down.t;
    const dx = Math.abs(e.clientX - down.x);
    const dy = Math.abs(e.clientY - down.y);

    if (dt <= TAP_MAX_MS && dx < 24 && dy < 24) {
      const mid = window.innerWidth / 2;
      if (down.x < mid) {
        goPrev();
      } else {
        goNext();
      }
    }
  };

  const handlePointerCancel = () => {
    pointerRef.current = null;
    clearHoldTimer();
    setPaused(false);
    resumeWrappedAudioFromHold();
  };

  const handleTouchEnd = (e) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || !e.changedTouches?.[0]) {
      return;
    }
    const dy = e.changedTouches[0].clientY - start.y0;
    if (dy > 72) {
      onExit();
    }
  };

  return (
    <div
      className={cn(
        "wrapped-player wrapped-player--immersive fixed inset-0 z-50 flex flex-col font-sans text-ink"
      )}
      style={{ ...slideThemeStyle, ...slideSurfaceVars }}
      data-slide-theme={slideTheme}
      data-slide-template={slideTemplate}
      role="dialog"
      aria-modal="true"
      aria-label={`Wrapped story ${cardIndex + 1} of ${cardCount}`}
    >
      <div
        className="wrapped-player__stage"
        style={{ background: slideBackground }}
        aria-hidden
      />
      <div
        className={cn(
          "wrapped-player__tint",
          isHeroTemplate ? "wrapped-player__tint--hero" : "wrapped-player__tint--data"
        )}
        aria-hidden
      />
      <div className="wrapped-player__grain" aria-hidden />

      <div
        className={cn(
          "relative z-10 shrink-0 px-2",
          "pt-[max(0.5rem,env(safe-area-inset-top))]"
        )}
      >
        <div className="flex gap-1 pb-1.5">
          {Array.from({ length: cardCount }).map((_, i) => {
            let fill = 0;
            if (i < cardIndex) {
              fill = 1;
            } else if (i === cardIndex) {
              fill = progress;
            }
            return (
              <div
                key={i}
                className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-pill bg-white/35"
                aria-hidden
              >
                <div
                  className="h-full rounded-pill bg-white transition-[width] duration-75 ease-linear"
                  style={{ width: `${fill * 100}%` }}
                />
              </div>
            );
          })}
        </div>

        <WrappedMusicPlayer onExit={onExit} className="pb-1" />
      </div>

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "manipulation" }}
      >
        <WrappedPlayerSlide
          ref={slideRef}
          key={cardIndex}
          cardIndex={cardIndex}
          template={slideTemplate}
        >
          <WrappedSlideErrorBoundary resetKey={cardIndex}>
            {renderSlide(cardIndex)}
          </WrappedSlideErrorBoundary>
        </WrappedPlayerSlide>

        <p
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-center text-[0.72rem]",
            isHeroTemplate ? "text-white/55" : "text-muted"
          )}
        >
          {isLastSlide
            ? "Tap left to go back · screenshot to share · swipe down when you're done"
            : paused
              ? "Release to resume"
              : "Tap right for next · hold to pause · swipe down to exit"}
        </p>
      </div>
    </div>
  );
}
