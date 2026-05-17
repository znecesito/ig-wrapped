import React from "react";

export function WrappedSlideShell({
  cardIndex,
  cardCount,
  themeClass = "",
  extraClass = "",
  cardRef,
  children
}) {
  const classNames = ["wrapped-card", "card", themeClass, extraClass].filter(Boolean).join(" ");

  return (
    <article ref={cardRef} className={classNames} data-slide-index={cardIndex}>
      <span className="wrapped-card__slide-index" aria-hidden="true">
        {cardIndex + 1}/{cardCount}
      </span>
      <div className="wrapped-card__safe">
        <div className="wrapped-card__safe-main">{children}</div>
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
    <div className="wrapped-card__layout">
      <header className="wrapped-card__head">
        <p className="wrapped-card__eyebrow">{eyebrow}</p>
        <h2 className="wrapped-card__title">{title}</h2>
        {deck ? <p className="wrapped-card__deck muted">{deck}</p> : null}
      </header>
      <div className={`wrapped-card__body-zone${bodyClassName ? ` ${bodyClassName}` : ""}`}>
        {children}
        {bodyQuip ? <div className="wrapped-card__body-quip">{bodyQuip}</div> : null}
      </div>
      <footer className="wrapped-card__foot">
        <p className="wrapped-card__footer wrapped-card__footer--merged">
          <span className="wrapped-card__footer-brand">ig-wrapped</span>
          {footerStat ? (
            <span className="wrapped-card__footer-stat">{footerStat}</span>
          ) : null}
        </p>
      </footer>
    </div>
  );
}
