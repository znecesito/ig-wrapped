import React from "react";
import { WrappedSlideShell } from "./WrappedSlideChrome.jsx";
import { getSlideTheme } from "../utils/wrappedThemes.js";
import { renderWrappedSlide } from "../pages/wrappedSlideContent.jsx";

const WRAPPED_CARD_COUNT = 10;

/**
 * Off-screen 1080×1920 story frame for PNG export. Same slide content as the scroller,
 * with exportMode styling (flat glass, full labels, no capture-hostile effects).
 */
export default function WrappedSlideExport({ slideIndex, slideCtx, cardRef }) {
  const exportCtx = { ...slideCtx, exportMode: true };

  return (
    <div className="wrapped-card-export-host" aria-hidden="true">
      <div className="wrapped-story wrapped-card-export-stage">
        <WrappedSlideShell
          cardIndex={slideIndex}
          cardCount={WRAPPED_CARD_COUNT}
          themeClass={`wrapped-theme--${getSlideTheme(slideIndex)}`}
          extraClass={
            slideIndex === 9 ? "wrapped-card--export wrapped-card--teaser" : "wrapped-card--export"
          }
          cardRef={cardRef}
        >
          {renderWrappedSlide(slideIndex, exportCtx)}
        </WrappedSlideShell>
      </div>
    </div>
  );
}
