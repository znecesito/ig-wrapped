import React from "react";
import LandingPreviewTeaser from "./LandingPreviewTeaser.jsx";
import {
  LANDING_PREVIEW_SLIDES,
  getPreviewSlideAccent
} from "./landingPreviewSlides.js";
import { getSlideTemplate } from "../../utils/wrappedThemes.js";

export default function LandingPreview() {
  return (
    <div className="landing-preview">
      <p className="landing-preview__lede">
        Six story cards from your export — tap through at your pace, screenshot any beat to share.
      </p>

      <ul className="landing-preview__grid">
        {LANDING_PREVIEW_SLIDES.map((slide) => {
          const accent = getPreviewSlideAccent(slide.index);
          const template = getSlideTemplate(slide.index);

          return (
            <li key={slide.index} className="landing-preview__card">
              <LandingPreviewTeaser type={slide.teaser} accent={accent} template={template} />
              <div className="landing-preview__meta">
                <p className="landing-preview__index">Slide {slide.index + 1}</p>
                <h3 className="landing-preview__title">{slide.title}</h3>
                <p className="landing-preview__copy">{slide.copy}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
