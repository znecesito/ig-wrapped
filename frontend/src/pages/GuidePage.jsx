import React from "react";
import ExportGuide from "../components/ExportGuide.jsx";
import ExportPicker from "../components/ExportPicker.jsx";
import { PAGE_TITLE } from "../components/wrappedSlideClasses.js";

export default function GuidePage() {
  return (
    <section className="container guide-page">
      <h1 className={PAGE_TITLE}>How to export</h1>
      <p className="guide-page__lede muted">
        Get your Instagram data onto this device, then load it into ig-wrapped. Wrapped never uploads your
        export to our servers.
      </p>
      <ExportGuide />
      <div className="card guide-page__picker">
        <h2 className="guide-page__picker-title">Load export</h2>
        <ExportPicker />
      </div>
    </section>
  );
}
