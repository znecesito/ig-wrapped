import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/utils.js";
import { WrappedSlideShell } from "./WrappedSlideChrome.jsx";
import { getSlideTheme, getSlideThemeStyle, getSlideTemplate } from "../utils/wrappedThemes.js";
import {
  getSlideDurationMs,
  WRAPPED_CARD_COUNT,
  WRAPPED_LAST_SLIDE_INDEX
} from "../config/wrappedPlayer.js";
import {
  createSlideBeatTimeline,
  killSlideTimeline
} from "../utils/wrappedSlideTimeline.js";

const TAP_MAX_MS = 280;
const PRIVACY_ANIM_MS = 3200;

/**
 * Full-screen story player: progress segments, tap nav, hold-to-pause, auto-advance.
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
  const [enterClass, setEnterClass] = useState("wrapped-card--from-next");

  const cardRef = useRef(null);
  const pointerRef = useRef(null);
  const swipeRef = useRef(null);
  const rafRef = useRef(null);
  const timelineRef = useRef(null);

  const durationMs = getSlideDurationMs(cardIndex);
  const isLastSlide = cardIndex >= WRAPPED_LAST_SLIDE_INDEX;
  const autoAdvance = durationMs > 0 && !isLastSlide;
  const slideTheme = getTheme(cardIndex);
  const slideThemeStyle = getSlideThemeStyle(slideTheme);
  const slideTemplate = getSlideTemplate(cardIndex);

  const goTo = useCallback(
    (nextIndex) => {
      const clamped = Math.max(0, Math.min(cardCount - 1, nextIndex));
      if (clamped === cardIndex) {
        return;
      }
      const direction = clamped > cardIndex ? 1 : -1;
      setEnterClass(direction > 0 ? "wrapped-card--from-next" : "wrapped-card--from-prev");
      onIndexChange(clamped);
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

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
    setPaused(false);
  }, [cardIndex]);

  // GSAP scene timeline per slide (Phase H) — layout effect so DOM + refs are ready
  useLayoutEffect(() => {
    const root = cardRef.current;
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

      const animDurationMs = autoAdvance ? durationMs : PRIVACY_ANIM_MS;
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

      timelineRef.current = tl;

      if (tl) {
        tl.play(0);
      }
    };

    // one frame so slide children (DropDownText cells) are committed
    const raf = requestAnimationFrame(startTimeline);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      killSlideTimeline(tl);
      if (timelineRef.current === tl) {
        timelineRef.current = null;
      }
    };
  }, [cardIndex, autoAdvance, durationMs, goNext, slideTemplate]);

  // Hold-to-pause: freeze GSAP timeline
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) {
      return;
    }
    if (paused) {
      tl.pause();
    } else {
      tl.play();
    }
  }, [paused]);

  // Progress bar synced to timeline
  useEffect(() => {
    if (!autoAdvance) {
      return undefined;
    }

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
  }, [autoAdvance, cardIndex]);

  // Keyboard: arrows navigate, Escape exits
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
    setPaused(true);
  };

  const handlePointerUp = (e) => {
    const down = pointerRef.current;
    pointerRef.current = null;
    setPaused(false);

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
    setPaused(false);
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
      className={cn("wrapped-player fixed inset-0 z-50 flex flex-col font-sans text-ink", "wrapped-player--flat")}
      style={slideThemeStyle}
      data-slide-theme={slideTheme}
      role="dialog"
      aria-modal="true"
      aria-label={`Wrapped story ${cardIndex + 1} of ${cardCount}`}
    >
      <div className="wrapped-player__stage" aria-hidden />
      <div className="wrapped-player__grain" aria-hidden />
      <div
        className={cn(
          "flex shrink-0 gap-1 px-2",
          "pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
        )}
      >
        {Array.from({ length: cardCount }).map((_, i) => {
          let fill = 0;
          if (i < cardIndex) {
            fill = 1;
          } else if (i === cardIndex) {
            fill = isLastSlide ? 1 : progress;
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

      <button
        type="button"
        data-no-hold
        className={cn(
          "absolute right-3 top-[max(0.35rem,env(safe-area-inset-top))] z-[60]",
          "flex size-9 items-center justify-center rounded-full",
          "border-0 bg-black/25 text-lg leading-none text-white backdrop-blur-sm",
          "transition-colors hover:bg-black/40"
        )}
        aria-label="Exit Wrapped"
        onClick={onExit}
      >
        ×
      </button>

      <div
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "manipulation" }}
      >
        <div className="wrapped-player__card-wrap relative min-h-0 w-full flex-1">
          <WrappedSlideShell
            ref={cardRef}
            key={cardIndex}
            cardIndex={cardIndex}
            cardCount={cardCount}
            theme={slideTheme}
            playerMode
            playerFlat
            extraClass={cn("wrapped-card--visible", enterClass)}
          >
            {renderSlide(cardIndex)}
          </WrappedSlideShell>
        </div>

        <p
          className={cn(
            "pointer-events-none mt-3 text-center text-[0.72rem]",
            slideTemplate === "hero" ? "text-white/55" : "text-muted"
          )}
        >
          {isLastSlide
            ? "Tap to go back · screenshot to share · swipe down when you're done"
            : paused
              ? "Release to resume"
              : "Tap sides to skip · hold to pause · swipe down to exit"}
        </p>
      </div>
    </div>
  );
}
