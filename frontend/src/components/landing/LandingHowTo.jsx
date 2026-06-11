import React from "react";
import ExportGuide from "../ExportGuide.jsx";
import { LOBBY_START_BTN } from "../wrappedSlideClasses.js";
import { cn } from "../../lib/utils.js";

export default function LandingHowTo({ onGetStarted }) {
  return (
    <div className="landing-how-to">
      <p className="landing-how-to__intro">
        <strong>Returning?</strong> Request a fresh export for activity since your last visit — Meta
        download links expire after a few days. Pick JSON, not HTML.
      </p>

      <ExportGuide hideTitle />

      <div className="landing-how-to__cta-bar">
        <button
          type="button"
          className={cn(LOBBY_START_BTN, "landing-how-to__cta")}
          onClick={onGetStarted}
        >
          Ready? Get your Wrapped
        </button>
      </div>
    </div>
  );
}
