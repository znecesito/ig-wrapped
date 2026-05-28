import React from "react";
import { cn } from "../lib/utils.js";

const NAV_BTN =
  "min-w-[6.5rem] rounded-pill bg-gradient-to-br from-nav-link to-slate-900 text-white shadow-[0_2px_8px_rgba(15,23,42,0.2)] transition-[transform,box-shadow,filter] duration-200 ease-out hover:enabled:-translate-y-0.5 hover:enabled:scale-[1.02] hover:enabled:shadow-card-hover hover:enabled:brightness-105 active:enabled:translate-y-0 active:enabled:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45";

const DOT_BASE =
  "size-[9px] min-h-0 cursor-pointer rounded-full border-0 bg-border-strong p-0 transition-[transform,background,box-shadow] duration-[250ms] ease-out hover:scale-[1.2] hover:bg-brand/45";

const DOT_ACTIVE =
  "scale-125 bg-gradient-to-br from-brand to-brand-mid shadow-dot-active";

/**
 * Story deck chrome: prev/next, dots, viewport, scroller.
 * Cards render as children; parent keeps refs/observers.
 */
export default function WrappedStoryDeck({
  cardIndex,
  cardCount,
  onPrevious,
  onNext,
  onGoToIndex,
  scrollerRef,
  children,
  viewportLabel
}) {
  return (
    <div className={cn("wrapped-story", "mt-[1.1rem]")}>
      <div className="mb-3 flex justify-center gap-3">
        <button type="button" className={NAV_BTN} onClick={onPrevious} disabled={cardIndex <= 0}>
          Previous
        </button>
        <button
          type="button"
          className={NAV_BTN}
          onClick={onNext}
          disabled={cardIndex >= cardCount - 1}
        >
          Next
        </button>
      </div>

      <div
        className="mb-3.5 flex flex-wrap justify-center gap-1.5"
        role="tablist"
        aria-label="Wrapped slides"
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={cardIndex === i}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(DOT_BASE, cardIndex === i && DOT_ACTIVE)}
            onClick={() => onGoToIndex(i)}
          />
        ))}
      </div>

      <div
        className={cn(
          "flex justify-center rounded-deck border border-border p-2.5 shadow-deck",
          "bg-deck-viewport"
        )}
        aria-live="polite"
        aria-label={viewportLabel}
      >
        <div
          ref={scrollerRef}
          className={cn(
            "wrapped-story__scroller",
            "flex w-[var(--wrapped-frame-width)] max-h-[min(78vh,680px)] flex-col gap-[0.85rem]",
            "overflow-y-auto scroll-smooth snap-y snap-mandatory",
            "py-[0.35rem] px-[0.15rem] pb-2"
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>

      <p className="muted mt-2.5 text-center text-sm">Screenshot any card to share to Stories.</p>
    </div>
  );
}
