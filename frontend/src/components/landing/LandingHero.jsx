import React from "react";
import { LOBBY_START_BTN } from "../wrappedSlideClasses.js";
import { cn } from "../../lib/utils.js";

const TRUST_ITEMS = [
  "Runs on your device",
  "Never uploaded",
  "No account",
  "JSON export only"
];

function LandingPhoneMock() {
  return (
    <div className="landing-hero__mock" aria-hidden>
      <div className="landing-hero__phone">
        <div className="landing-hero__phone-notch" />
        <div className="landing-hero__phone-screen">
          <div className="landing-hero__phone-progress">
            <span className="landing-hero__phone-segment is-filled" />
            <span className="landing-hero__phone-segment is-filled" />
            <span className="landing-hero__phone-segment" />
            <span className="landing-hero__phone-segment" />
            <span className="landing-hero__phone-segment" />
            <span className="landing-hero__phone-segment" />
          </div>
          <p className="landing-hero__phone-eyebrow">Your Instagram</p>
          <p className="landing-hero__phone-title">Wrapped</p>
          <p className="landing-hero__phone-handle">@you</p>
          <p className="landing-hero__phone-lede">
            Activity, rhythm, top people &amp; inbox — as story cards.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingHero({ onGetStarted, onHowToExport }) {
  return (
    <section id="hero" className="landing-hero" aria-labelledby="landing-hero-heading">
      <div className="container landing-hero__inner">
        <div className="landing-hero__copy">
          <h1 id="landing-hero-heading" className="landing-hero__headline">
            The recap Meta never built.
          </h1>
          <p className="landing-hero__subhead">
            Spotify gets a Wrapped. Instagram gives you a ZIP. Turn yours into tap-through story
            cards — privately, in your browser.
          </p>

          <div className="landing-hero__ctas">
            <button type="button" className={cn(LOBBY_START_BTN, "landing-hero__cta-primary")} onClick={onGetStarted}>
              Get your Wrapped
            </button>
            <button
              type="button"
              className="landing-hero__cta-secondary"
              onClick={onHowToExport}
            >
              How to get your export
            </button>
          </div>

          <ul className="landing-hero__trust" aria-label="Privacy and trust">
            {TRUST_ITEMS.map((item, index) => (
              <li key={item}>
                {index > 0 ? <span className="landing-hero__trust-sep" aria-hidden>·</span> : null}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <LandingPhoneMock />
      </div>
    </section>
  );
}
