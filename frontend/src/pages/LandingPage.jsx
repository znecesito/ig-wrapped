import React, { useEffect } from "react";
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

function Placeholder({ children }) {
  return <p className="landing-section__placeholder">{children}</p>;
}

export default function LandingPage() {
  useEffect(() => {
    if (window.location.hash !== LANDING_HASH_HOW_TO) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      scrollToLandingSection("how-to", { behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="landing-page">
      <LandingSection id="hero" title="Hero">
        <Placeholder>Phase M — headline, CTAs, trust strip, phone mock.</Placeholder>
      </LandingSection>

      <LandingSection id="preview" title="What you get">
        <Placeholder>Phase N — six slide teasers (intro → privacy).</Placeholder>
      </LandingSection>

      <LandingSection id="steps" title="How it works">
        <Placeholder>Phase O — request export → load ZIP → play Wrapped.</Placeholder>
      </LandingSection>

      <LandingSection id="how-to" title="How to get your export">
        <Placeholder>Phase O — embedded ExportGuide + re-export note.</Placeholder>
      </LandingSection>

      <LandingSection id="faq" title="FAQ">
        <Placeholder>Phase P — export wait time, JSON vs HTML, sharing, re-export.</Placeholder>
      </LandingSection>

      <LandingSection id="cta" title="Get your Wrapped">
        <Placeholder>Phase P — final CTA band → /wrapped.</Placeholder>
      </LandingSection>
    </div>
  );
}
