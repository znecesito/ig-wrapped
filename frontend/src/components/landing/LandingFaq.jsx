import React from "react";

const FAQ_ITEMS = [
  {
    id: "export-wait",
    question: "How long does the Instagram export take?",
    answer:
      "Usually a few hours, but Meta says it can take up to a few days for large accounts. You'll get an email titled \"Your Meta information download is ready\" when it's done. The download link expires after a few days, so grab the ZIP soon after you get the email."
  },
  {
    id: "json-vs-html",
    question: "Should I pick JSON or HTML?",
    answer:
      "JSON. ig-wrapped reads the machine-readable JSON files inside your export — not the HTML pages Meta also offers. On the export setup screen, keep format set to JSON and export to your device."
  },
  {
    id: "privacy",
    question: "Does my export get uploaded?",
    answer:
      "No. Your ZIP or folder is parsed entirely in your browser. Nothing is sent to our servers — there isn't even a sign-in. Close the tab and the data is gone unless you load it again."
  },
  {
    id: "meta-affiliation",
    question: "Is this from Instagram or Meta?",
    answer:
      "No. ig-wrapped is an independent fan project — not affiliated with, endorsed by, or sponsored by Meta, Instagram, or Spotify. We just think your export deserves a better recap than a folder of JSON."
  },
  {
    id: "sharing",
    question: "How do I share my Wrapped?",
    answer:
      "Screenshot any story card while you play through and post it to Instagram Stories like any other image. We don't upload or host your recap for you."
  },
  {
    id: "re-export",
    question: "I already exported once — do I need a new one?",
    answer:
      "If your download link expired or you want a fresher date range, request a new export in Accounts Center. Each visit to Wrapped expects a current ZIP or folder on your device — we don't store exports between sessions."
  }
];

export default function LandingFaq() {
  return (
    <div className="landing-faq">
      <p className="landing-faq__lede">
        Quick answers before you load your export — privacy, format, and what to expect from Meta.
      </p>

      <div className="landing-faq__list">
        {FAQ_ITEMS.map((item) => (
          <details key={item.id} className="landing-faq__item" id={`faq-${item.id}`}>
            <summary className="landing-faq__question">{item.question}</summary>
            <p className="landing-faq__answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
