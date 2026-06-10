import React from "react";

function IntroTeaser() {
  return (
    <>
      <p className="landing-preview-teaser__eyebrow">Your Instagram</p>
      <p className="landing-preview-teaser__title">Wrapped</p>
      <p className="landing-preview-teaser__handle">@you</p>
    </>
  );
}

function ActivityTeaser() {
  const bars = [
    { label: "Likes", w: "72%", color: "#db2777" },
    { label: "Comments", w: "48%", color: "#7c3aed" },
    { label: "Stories", w: "36%", color: "#d97706" }
  ];
  return (
    <div className="landing-preview-teaser__stack">
      {bars.map((bar) => (
        <div key={bar.label} className="landing-preview-teaser__stack-row">
          <span className="landing-preview-teaser__stack-label">{bar.label}</span>
          <div className="landing-preview-teaser__stack-track">
            <span className="landing-preview-teaser__stack-fill" style={{ width: bar.w, backgroundColor: bar.color }} />
          </div>
        </div>
      ))}
      <p className="landing-preview-teaser__stat">2,847 activities</p>
    </div>
  );
}

function RhythmTeaser() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="landing-preview-teaser__rhythm">
      <div className="landing-preview-teaser__week">
        {days.map((day, i) => (
          <span
            key={`${day}-${i}`}
            className={i === 4 ? "landing-preview-teaser__day is-peak" : "landing-preview-teaser__day"}
          >
            {day}
          </span>
        ))}
      </div>
      <p className="landing-preview-teaser__persona">Friday person</p>
    </div>
  );
}

function PeopleTeaser() {
  return (
    <svg className="landing-preview-teaser__chart" viewBox="0 0 120 64" aria-hidden>
      <polyline
        points="4,52 28,40 52,44 76,22 96,28 116,12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="4,58 28,48 52,50 76,38 96,42 116,32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}

function InboxTeaser() {
  const rows = ["@alex sent a message", "3 new likes", "@jamie commented"];
  return (
    <ul className="landing-preview-teaser__inbox">
      {rows.map((row, i) => (
        <li
          key={row}
          className="landing-preview-teaser__notif"
          style={{ transform: `translateY(${i * 3}px) scale(${1 - i * 0.04})`, opacity: 1 - i * 0.12 }}
        >
          {row}
        </li>
      ))}
    </ul>
  );
}

function PrivacyTeaser() {
  return (
    <div className="landing-preview-teaser__privacy">
      <span className="landing-preview-teaser__lock" aria-hidden>
        🔒
      </span>
      <p className="landing-preview-teaser__privacy-line">100% on your device</p>
    </div>
  );
}

const TEASER_BY_TYPE = {
  intro: IntroTeaser,
  activity: ActivityTeaser,
  rhythm: RhythmTeaser,
  people: PeopleTeaser,
  inbox: InboxTeaser,
  privacy: PrivacyTeaser
};

export default function LandingPreviewTeaser({ type, accent, template }) {
  const Teaser = TEASER_BY_TYPE[type] ?? IntroTeaser;
  const isDark = template === "hero" || template === "trust";

  return (
    <div
      className={`landing-preview-teaser landing-preview-teaser--${template}${isDark ? " is-dark" : ""}`}
      style={{ "--preview-accent": accent }}
      aria-hidden
    >
      <div className="landing-preview-teaser__progress">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={i <= 1 ? "is-filled" : undefined} />
        ))}
      </div>
      <Teaser />
    </div>
  );
}
