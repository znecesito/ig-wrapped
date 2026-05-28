import React from "react";
import { cn } from "../lib/utils.js";

/** Maps slide theme keys to legacy CSS modifiers (--slide-accent, glass tints). */
export function slideThemeClass(theme) {
  return theme ? `wrapped-theme--${theme}` : "";
}

export function WrappedSlideShell({
  cardIndex,
  cardCount,
  theme = "intro",
  extraClass = "",
  cardRef,
  children
}) {
  return (
    <article
      ref={cardRef}
      data-slide-index={cardIndex}
      className={cn(
        "wrapped-card card",
        slideThemeClass(theme),
        extraClass
      )}
    >
      <span
        className={cn(
          "wrapped-card__slide-index",
          "absolute top-2 right-2.5 z-[2]",
          "rounded-pill border border-white/95 bg-white/80",
          "px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide text-muted"
        )}
        aria-hidden="true"
      >
        {cardIndex + 1}/{cardCount}
      </span>
      <div
        className={cn(
          "wrapped-card__safe",
          "relative z-[1] flex h-full min-h-0 flex-col",
          "px-3.5 pb-[calc(var(--wrapped-safe-bottom)+0.35rem)] pt-[var(--wrapped-safe-top)]"
        )}
      >
        <div className="wrapped-card__safe-main flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </article>
  );
}

export function WrappedSlideLayout({
  eyebrow,
  title,
  deck,
  bodyClassName = "",
  children,
  footerStat,
  bodyQuip
}) {
  return (
    <div
      className={cn(
        "wrapped-card__layout",
        "flex min-h-0 flex-1 flex-col justify-center gap-[0.32rem]"
      )}
    >
      <header className="wrapped-card__head shrink-0">
        <p
          className={cn(
            "wrapped-card__eyebrow",
            "m-0 mb-0.5 text-[0.62rem] font-bold uppercase tracking-[0.11em]",
            "text-[var(--slide-accent)]"
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            "wrapped-card__title",
            "m-0 font-display text-[clamp(1.05rem,4vw,1.28rem)] font-bold leading-tight tracking-tight text-ink"
          )}
        >
          {title}
        </h2>
        {deck ? (
          <p className={cn("wrapped-card__deck muted", "mt-0.5 text-[0.74rem] leading-snug")}>{deck}</p>
        ) : null}
      </header>
      <div
        className={cn(
          "wrapped-card__body-zone",
          "flex min-h-0 flex-[0_1_auto] flex-col items-stretch justify-center gap-[0.28rem] overflow-y-auto",
          bodyClassName === "wrapped-card__body-zone--hero" &&
            "wrapped-card__body-zone--hero items-center text-center",
          bodyClassName && bodyClassName !== "wrapped-card__body-zone--hero" && bodyClassName
        )}
      >
        {children}
        {bodyQuip ? (
          <div
            className={cn(
              "wrapped-card__body-quip",
              "mt-1.5 shrink-0 border-t border-slate-200/85 pt-1.5 text-[0.74rem] leading-snug text-muted"
            )}
          >
            {bodyQuip}
          </div>
        ) : null}
      </div>
      <footer className="wrapped-card__foot mt-0 shrink-0 pt-0.5">
        <p
          className={cn(
            "wrapped-card__footer wrapped-card__footer--merged",
            "m-0 flex items-baseline justify-between gap-2 border-t border-slate-200/95 pt-1.5",
            "text-[0.68rem] leading-snug text-muted"
          )}
        >
          <span
            className={cn(
              "wrapped-card__footer-brand",
              "shrink-0 font-extrabold uppercase tracking-[0.12em] text-[var(--slide-accent)]"
            )}
          >
            ig-wrapped
          </span>
          {footerStat ? (
            <span className="wrapped-card__footer-stat min-w-0 truncate text-right">{footerStat}</span>
          ) : null}
        </p>
      </footer>
    </div>
  );
}
