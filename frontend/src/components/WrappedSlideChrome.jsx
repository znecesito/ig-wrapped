import React from "react";
import { cn } from "../lib/utils.js";
import { SLIDE_DECK } from "./wrappedSlideClasses.js";
import { CARD_SURFACE_BG, getSlideThemeStyle } from "../utils/wrappedThemes.js";

const CARD_SHELL = [
  "wrapped-card card",
  "relative m-0 flex w-full shrink-0 flex-col overflow-hidden p-0",
  "aspect-[9/16] snap-start snap-always rounded-[14px] border text-ink",
  "opacity-0 translate-y-[18px]",
  "shadow-card backdrop-blur-[14px]",
  "border-[var(--slide-glass-border)]",
  "has-[.wrapped-leaderboard]:overflow-visible"
];

const CARD_TINT_OVERLAY =
  "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(85%_55%_at_100%_0%,var(--slide-tint)_0%,transparent_58%)]";

export function WrappedSlideShell({
  cardIndex,
  cardCount,
  theme = "intro",
  extraClass = "",
  cardRef,
  children
}) {
  const themeStyle = getSlideThemeStyle(theme);
  const isTeaser = theme === "teaser";

  return (
    <article
      ref={cardRef}
      data-slide-index={cardIndex}
      className={cn(
        CARD_SHELL,
        isTeaser && "border-dashed border-border-strong",
        extraClass
      )}
      style={{
        ...themeStyle,
        background: CARD_SURFACE_BG,
        ...(isTeaser ? { borderColor: "#cbd5e1" } : null)
      }}
    >
      <div className={CARD_TINT_OVERLAY} aria-hidden />
      <span
        className={cn(
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
          "relative z-[1] flex h-full min-h-0 flex-col",
          "px-3.5 pb-[calc(var(--wrapped-safe-bottom)+0.35rem)] pt-[var(--wrapped-safe-top)]",
          "has-[.wrapped-leaderboard]:overflow-visible"
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            "has-[.wrapped-leaderboard]:overflow-visible"
          )}
        >
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
  const isHero = bodyClassName === "hero";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col justify-center gap-[0.32rem]",
        "has-[.wrapped-leaderboard]:gap-[0.45rem]",
        "has-[.wrapped-leaderboard]:[&_.slide-deck]:mb-0.5"
      )}
    >
      <header className="shrink-0">
        <p
          className={cn(
            "m-0 mb-0.5 text-[0.62rem] font-bold uppercase tracking-[0.11em]",
            "text-[var(--slide-accent)]"
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            "m-0 font-display text-[clamp(1.05rem,4vw,1.28rem)] font-bold leading-tight tracking-tight text-ink"
          )}
        >
          {title}
        </h2>
        {deck ? (
          <p className={cn(SLIDE_DECK, "mt-0.5 text-[0.74rem] leading-snug text-muted")}>{deck}</p>
        ) : null}
      </header>
      <div
        className={cn(
          "flex min-h-0 flex-[0_1_auto] flex-col items-stretch justify-center gap-[0.28rem] overflow-y-auto",
          "has-[.wrapped-leaderboard]:overflow-visible",
          isHero && "items-center text-center",
          bodyClassName && !isHero && bodyClassName
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
        {bodyQuip ? (
          <div
            className={cn(
              "mt-1.5 shrink-0 border-t border-slate-200/85 pt-1.5 text-[0.74rem] leading-snug text-muted"
            )}
          >
            {bodyQuip}
          </div>
        ) : null}
      </div>
      <footer className="mt-0 shrink-0 pt-0.5">
        <p
          className={cn(
            "m-0 flex items-baseline justify-between gap-2 border-t border-slate-200/95 pt-1.5",
            "text-[0.68rem] leading-snug text-muted"
          )}
        >
          <span
            className={cn(
              "shrink-0 font-extrabold uppercase tracking-[0.12em] text-[var(--slide-accent)]"
            )}
          >
            ig-wrapped
          </span>
          {footerStat ? (
            <span
              className={cn(
                "min-w-0 truncate text-right",
                "[&_strong]:font-bold [&_strong]:text-ink"
              )}
            >
              {footerStat}
            </span>
          ) : null}
        </p>
      </footer>
    </div>
  );
}
