import React from "react";
import { LOBBY_START_BTN } from "../wrappedSlideClasses.js";
import { cn } from "../../lib/utils.js";

export default function LandingFinalCta({ onGetStarted, onHowToExport }) {
  return (
    <section
      id="cta"
      className="landing-cta"
      aria-labelledby="landing-cta-heading"
    >
      <div className="container landing-cta__inner">
        <h2 id="landing-cta-heading" className="landing-cta__headline">
          Ready for your recap?
        </h2>
        <p className="landing-cta__copy">
          Load your JSON export and play through six story cards — activity, rhythm, top people,
          inbox, and privacy. All on your device, nothing uploaded.
        </p>

        <div className="landing-cta__actions">
          <button
            type="button"
            className={cn(LOBBY_START_BTN, "landing-cta__primary")}
            onClick={onGetStarted}
          >
            Get your Wrapped
          </button>
          <button type="button" className="landing-cta__secondary" onClick={onHowToExport}>
            How to get your export
          </button>
        </div>

        <ul className="landing-cta__trust" aria-label="Privacy and trust">
          <li>Runs in your browser</li>
          <li>Never uploaded</li>
          <li>No account</li>
        </ul>
      </div>
    </section>
  );
}
