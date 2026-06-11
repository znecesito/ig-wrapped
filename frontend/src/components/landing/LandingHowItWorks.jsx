import React from "react";

const STEPS = [
  {
    number: 1,
    title: "Request your export",
    copy: "In Instagram’s Accounts Center, export to device as JSON — about 6 months to 1 year works best."
  },
  {
    number: 2,
    title: "Load your ZIP",
    copy: "When Meta emails you, download the file and open ig-wrapped — choose the ZIP or unzipped folder."
  },
  {
    number: 3,
    title: "Play Wrapped",
    copy: "Tap through six story cards at your pace. Screenshot any beat to share on Stories."
  }
];

export default function LandingHowItWorks() {
  return (
    <div className="landing-steps">
      <p className="landing-steps__lede">
        Three steps from Meta’s download to your recap — no account on our side.
      </p>
      <ol className="landing-steps__list">
        {STEPS.map((step) => (
          <li key={step.number} className="landing-steps__item">
            <span className="landing-steps__number" aria-hidden>
              {step.number}
            </span>
            <div className="landing-steps__body">
              <h3 className="landing-steps__title">{step.title}</h3>
              <p className="landing-steps__copy">{step.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
