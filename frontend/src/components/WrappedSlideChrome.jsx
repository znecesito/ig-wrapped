import React, { forwardRef } from "react";
import { cn } from "../lib/utils.js";
import {
  slideBodyQuipClass,
  slideDeckClass,
  slideEyebrowClass,
  slideFooterBrandClass,
  slideFooterClass,
  slideTitleClass
} from "./wrappedSlideClasses.js";
import { getCardSurfaceStyle, getSlideTemplate } from "../utils/wrappedThemes.js";

const CARD_SHELL_BASE = [
  "wrapped-card card",
  "relative m-0 flex w-full shrink-0 flex-col overflow-hidden p-0",
  "aspect-[9/16] snap-start snap-always text-ink",
  "opacity-0 translate-y-[18px]",
  "has-[.wrapped-leaderboard]:overflow-visible"
];

const CARD_SHELL_LEGACY = [
  "rounded-[14px] border shadow-card backdrop-blur-[14px]",
  "border-[var(--slide-glass-border)]"
];

const CARD_SHELL_PLAYER = [
  "rounded-[18px] border shadow-[0_20px_50px_-18px_rgb(15_23_42/0.35)]"
];

const CARD_TINT_OVERLAY =
  "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(85%_55%_at_100%_0%,var(--slide-tint)_0%,transparent_58%)]";

const CARD_TINT_HERO =
  "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(90%_70%_at_0%_100%,rgb(255_255_255/0.14)_0%,transparent_55%)]";

export const WrappedSlideShell = forwardRef(function WrappedSlideShell(
  {
    cardIndex,
    cardCount,
    theme = "intro",
    template: templateProp,
    extraClass = "",
    cardRef,
    playerMode = false,
    children
  },
  ref
) {
  const template = templateProp ?? getSlideTemplate(cardIndex);
  const isTeaser = theme === "teaser";
  const isHero = template === "hero";

  const surfaceStyle = getCardSurfaceStyle(theme, template, { playerMode });

  return (
    <article
      ref={ref ?? cardRef}
      data-slide-index={cardIndex}
      data-slide-template={template}
      className={cn(
        CARD_SHELL_BASE,
        playerMode ? CARD_SHELL_PLAYER : CARD_SHELL_LEGACY,
        playerMode && "wrapped-card--player opacity-100 translate-y-0",
        playerMode && `wrapped-card--${template}`,
        isTeaser && "border-dashed border-border-strong",
        extraClass
      )}
      style={{
        ...surfaceStyle,
        ...(isTeaser ? { borderColor: "#cbd5e1" } : null)
      }}
    >
      <div
        className={cn(isHero && playerMode ? CARD_TINT_HERO : CARD_TINT_OVERLAY)}
        aria-hidden
      />
      <span
        className={cn(
          "absolute top-2 right-2.5 z-[2]",
          "rounded-pill px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide",
          isHero && playerMode
            ? "border border-white/25 bg-black/15 text-white/75"
            : "border border-white/95 bg-white/80 text-muted"
        )}
        aria-hidden="true"
      >
        {cardIndex + 1}/{cardCount}
      </span>
      <div
        className={cn(
          "relative z-[1] flex h-full min-h-0 flex-col",
          "px-3.5 pb-[calc(var(--wrapped-safe-bottom)+0.35rem)] pt-[var(--wrapped-safe-top)]",
          "has-[.wrapped-leaderboard]:overflow-visible",
          playerMode && template === "data" && "px-4"
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
});

/** Story player — no card chrome; content centered on full-viewport slide background. */
export const WrappedPlayerSlide = forwardRef(function WrappedPlayerSlide(
  { cardIndex, template, children },
  ref
) {
  return (
    <div
      ref={ref}
      data-slide-index={cardIndex}
      data-slide-template={template}
      className={cn(
        "wrapped-slide-stage mx-auto flex w-full max-w-[min(100%,26rem)] min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 pb-[max(2.75rem,env(safe-area-inset-bottom)+1.75rem)] pt-4",
        template === "hero" && "wrapped-slide-stage--hero"
      )}
    >
      {children}
    </div>
  );
});

export function WrappedSlideLayout({
  template = "data",
  eyebrow,
  title,
  deck,
  bodyClassName = "",
  children,
  footerStat,
  bodyQuip,
  hideFooter = false,
  hideHeader = false
}) {
  const isHeroListLeft = bodyClassName === "hero-list";
  const isHeroTemplate = template === "hero";
  const showHeader = !hideHeader && (eyebrow || title || deck);

  return (
    <div
      className={cn(
        "wrapped-slide-layout flex w-full shrink-0 flex-col gap-[0.32rem]",
        "has-[.wrapped-leaderboard]:gap-[0.45rem]",
        "has-[.wrapped-leaderboard]:[&_.slide-deck]:mb-0.5",
        template === "data" && "gap-[0.38rem]",
        "items-center text-center",
        "has-[.wrapped-leaderboard]:items-center"
      )}
    >
      {showHeader ? (
        <header className={cn("shrink-0 w-full", template === "data" && "mb-0.5")}>
          {eyebrow ? (
            <p className={slideEyebrowClass(template)} data-wrapped-beat="eyebrow">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className={slideTitleClass(template)} data-wrapped-beat="title">
              {title}
            </h2>
          ) : null}
          {deck ? (
            <p className={slideDeckClass(template)} data-wrapped-beat="deck">
              {deck}
            </p>
          ) : null}
        </header>
      ) : null}
      <div
        className={cn(
          "flex min-h-0 flex-[0_1_auto] w-full flex-col items-center justify-center gap-[0.28rem] overflow-y-auto text-center",
          "has-[.wrapped-leaderboard]:overflow-visible",
          template === "data" && "gap-[0.32rem]",
          isHeroListLeft &&
            "[&_ul]:mx-auto [&_ul]:w-full [&_ul]:max-w-[17rem] [&_ul]:text-left"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
        {bodyQuip ? (
          <div className={slideBodyQuipClass(template)} data-wrapped-beat="quip">
            {bodyQuip}
          </div>
        ) : null}
      </div>
      {hideFooter ? null : (
      <footer className="w-full shrink-0 pt-3" data-wrapped-beat="footer">
        <p className={slideFooterClass(template)}>
          <span className={slideFooterBrandClass(template)}>ig-wrapped</span>
          {footerStat ? (
            <span
              className={cn(
                "min-w-0 truncate text-right",
                "[&_strong]:font-bold",
                isHeroTemplate ? "[&_strong]:text-[var(--slide-fg)]" : "[&_strong]:text-ink"
              )}
            >
              {footerStat}
            </span>
          ) : null}
        </p>
      </footer>
      )}
    </div>
  );
}
