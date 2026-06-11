import React, { useEffect } from "react";
import LandingFaq from "../components/landing/LandingFaq.jsx";
import LandingFinalCta from "../components/landing/LandingFinalCta.jsx";
import LandingHero from "../components/landing/LandingHero.jsx";
import LandingHowItWorks from "../components/landing/LandingHowItWorks.jsx";
import LandingHowTo from "../components/landing/LandingHowTo.jsx";
import LandingPreview from "../components/landing/LandingPreview.jsx";
import { LANDING_HASH_HOW_TO, scrollToLandingSection } from "../config/features.js";
import { PAGE_TITLE } from "../components/wrappedSlideClasses.js";

function LandingSection({ id, title, children }) {
  return (
    <section
      id={id}
      className="landing-section"
      aria-labelledby={`${id}-heading`}
    >
      <div className="container">
        <h2 id={`${id}-heading`} className={PAGE_TITLE}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export default function LandingPage({ onNavigate }) {
  useEffect(() => {
    if (window.location.hash !== LANDING_HASH_HOW_TO) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      scrollToLandingSection("how-to", { behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const goToWrapped = () => onNavigate("/wrapped");
  const goToHowTo = () => onNavigate(LANDING_HASH_HOW_TO);

  return (
    <div className="landing-page">
      <LandingHero onGetStarted={goToWrapped} onHowToExport={goToHowTo} />

      <LandingSection id="preview" title="What you get">
        <LandingPreview />
      </LandingSection>

      <LandingSection id="steps" title="How it works">
        <LandingHowItWorks />
      </LandingSection>

      <LandingSection id="how-to" title="How to get your export">
        <LandingHowTo onGetStarted={goToWrapped} />
      </LandingSection>

      <LandingSection id="faq" title="FAQ">
        <LandingFaq />
      </LandingSection>

      <LandingFinalCta onGetStarted={goToWrapped} onHowToExport={goToHowTo} />
    </div>
  );
}
