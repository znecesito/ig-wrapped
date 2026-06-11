import React from "react";
import ExportGuide from "../ExportGuide.jsx";
import { LOBBY_START_BTN } from "../wrappedSlideClasses.js";
import { cn } from "../../lib/utils.js";

export default function LandingHowTo({ onGetStarted }) {
  return (
    <div className="landing-how-to">
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
