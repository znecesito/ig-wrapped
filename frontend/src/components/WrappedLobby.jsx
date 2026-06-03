import React, { useMemo, useState } from "react";
import { cn } from "../lib/utils.js";
import {
  LOBBY_START_BTN,
  LOBBY_WARNING_ACK,
  LOBBY_WARNING_IMPACT,
  LOBBY_WARNING_ITEM,
  LOBBY_WARNING_SLIDES,
  PAGE_TITLE,
  WRAPPED_PAGE_LEDE
} from "./wrappedSlideClasses.js";
import { explainParseWarnings } from "../utils/parseWarningImpact.js";

export default function WrappedLobby({
  handle,
  insights,
  warnings = [],
  loadError,
  onStart
}) {
  const explained = useMemo(() => explainParseWarnings(warnings), [warnings]);
  const hasWarnings = explained.length > 0;
  const [acknowledged, setAcknowledged] = useState(!hasWarnings);

  const canStart = !loadError && (!hasWarnings || acknowledged);

  return (
    <section className="container wrapped-page">
      <h1 className={PAGE_TITLE}>Wrapped</h1>
      <p className={WRAPPED_PAGE_LEDE}>
        Your Instagram recap as story cards — private, in your browser. Tap through like Stories,
        hold to pause, or mute the soundtrack anytime. A shuffled playlist starts when you tap Start
        Wrapped. Screenshot any card to share.
      </p>

      {handle ? (
        <p className="mt-2 text-sm font-semibold text-ink">
          Loaded for <span className="text-brand">{handle}</span>
          {insights?.exportYear ? ` · ${insights.exportYear} in this export` : null}
        </p>
      ) : null}

      {loadError ? <div className="error mt-4">{loadError}</div> : null}

      {hasWarnings ? (
        <div className="card warning-card mt-4" role="status">
          <h2 className="m-0 mb-2 text-base font-bold">Before you start</h2>
          <p className="m-0 mb-3 text-sm text-muted">
            We found issues while reading your export. Wrapped still works — but some cards may be
            empty or low.
          </p>
          <ul className="m-0 list-none space-y-3 p-0">
            {explained.map((item) => (
              <li key={item.summary} className={LOBBY_WARNING_ITEM}>
                <p className="m-0 text-[0.82rem] leading-snug text-ink">{item.summary}</p>
                <p className={cn("m-0 mt-1", LOBBY_WARNING_IMPACT)}>{item.impact}</p>
                <p className={cn("m-0 mt-0.5", LOBBY_WARNING_SLIDES)}>
                  Affects: {item.slides.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
          <label className={cn("mt-4 flex cursor-pointer items-start gap-2", LOBBY_WARNING_ACK)}>
            <input
              type="checkbox"
              className="mt-0.5"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>I understand — some cards may be missing data</span>
          </label>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className={LOBBY_START_BTN}
          disabled={!canStart}
          onClick={onStart}
        >
          Start Wrapped
        </button>
        {!canStart && hasWarnings && !acknowledged ? (
          <p className="m-0 text-sm text-muted">Acknowledge warnings above to continue.</p>
        ) : null}
      </div>
    </section>
  );
}
