import gsap from "gsap";

/** Slides with hero “drop from sky” beats. */
const HERO_DROP_SLIDE_INDICES = new Set([1, 6, 8]);
const BAR_RACE_SLIDE_INDEX = 7;
const INTRO_DROP_SLIDE_INDEX = 0;

const INTRO_LINE_BEATS = ["title", "hero", "body"];
const DROP_CHAR_DURATION = 0.85;
const DROP_CHAR_STAGGER = 0.045;
const DROP_CHAR_EASE = "expo.inOut";
const INTRO_LINE_GAP = 0.4;

/** Stagger order for generic scene beats. */
const BEAT_SEQUENCE = [
  "eyebrow",
  "title",
  "deck",
  "hero",
  "avatar",
  "handle",
  "body",
  "stat",
  "stat-label",
  "stat-secondary",
  "quip",
  "chart",
  "footer"
];

const BEAT_GAP = 0.07;
const BEAT_DURATION = 0.38;
const SEGMENT_DURATION = 0.32;
const SEGMENT_STAGGER = 0.05;
const CARD_ENTER_DELAY = 0.14;

const DROP_FROM_Y = -120;
const DROP_DURATION = 0.62;
const DROP_EASE = "back.out(1.35)";
const DROP_STAGGER = 0.11;

export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function makeTimeline({ durationMs, onComplete }) {
  return gsap.timeline({
    paused: true,
    onComplete
  });
}

function padTimeline(tl, totalSec) {
  const hold = Math.max(0.35, totalSec - tl.duration());
  tl.to({}, { duration: hold });
  return tl;
}

function resetMotionTargets(targets) {
  gsap.set(targets, { opacity: 1, y: 0, scale: 1, scaleX: 1, flexGrow: undefined });
}

function collectBeats(rootEl) {
  const beats = [];
  for (const name of BEAT_SEQUENCE) {
    rootEl.querySelectorAll(`[data-wrapped-beat="${name}"]`).forEach((el) => {
      beats.push(el);
    });
  }
  return beats;
}

function animateFadeBeat(tl, el, cursor, { duration = BEAT_DURATION, ease = "power2.out", fromY = 16 } = {}) {
  gsap.set(el, { opacity: 0, y: fromY });
  tl.to(el, { opacity: 1, y: 0, duration, ease }, cursor);
  return cursor + BEAT_GAP;
}

function animateDropBeat(tl, el, cursor, { duration = DROP_DURATION } = {}) {
  gsap.set(el, { opacity: 0, y: DROP_FROM_Y, scale: 1.06 });
  tl.to(
    el,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      ease: DROP_EASE
    },
    cursor
  );
  return cursor + DROP_STAGGER;
}

/** Default staggered reveal (Phase H baseline). */
function buildGenericTimeline(rootEl, { durationMs, template, onComplete, reduced }) {
  const beats = collectBeats(rootEl);
  const segments = [...rootEl.querySelectorAll("[data-wrapped-beat-segment]:not([data-wrapped-race-segment])")];
  const totalSec = Math.max(0.5, durationMs / 1000);
  const isTrust = template === "trust";
  const tl = makeTimeline({ durationMs, onComplete });
  const allTargets = [...beats, ...segments];

  if (!allTargets.length) {
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    resetMotionTargets(allTargets);
    tl.to({}, { duration: totalSec });
    return tl;
  }

  gsap.set(beats, { opacity: 0, y: isTrust ? 8 : 16 });
  if (segments.length) {
    gsap.set(segments, {
      opacity: 0,
      scale: isTrust ? 1 : 0.92,
      y: isTrust ? 6 : 12
    });
  }

  let cursor = CARD_ENTER_DELAY;

  for (const el of beats) {
    tl.to(
      el,
      {
        opacity: 1,
        y: 0,
        duration: isTrust ? BEAT_DURATION * 0.85 : BEAT_DURATION,
        ease: isTrust ? "power1.out" : "power2.out"
      },
      cursor
    );
    cursor += isTrust ? BEAT_GAP * 0.75 : BEAT_GAP;
  }

  if (segments.length) {
    tl.to(
      segments,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: SEGMENT_DURATION,
        stagger: SEGMENT_STAGGER,
        ease: "power2.out"
      },
      cursor
    );
  }

  return padTimeline(tl, totalSec);
}

/** Slide 0 — CodePen-style per-character drop (title → handle → activities). */
function buildIntroDropTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });
  const lines = INTRO_LINE_BEATS.map((beat) => rootEl.querySelector(`[data-wrapped-beat="${beat}"]`)).filter(
    Boolean
  );
  const allChars = lines.flatMap((line) => [...line.querySelectorAll(".wrapped-drop-text__char")]);

  if (!lines.length) {
    if (import.meta.env.DEV) {
      console.warn("[wrapped] intro slide: no drop lines found in", rootEl);
    }
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    gsap.set(lines, { autoAlpha: 1 });
    gsap.set(allChars, { yPercent: 0, opacity: 1, visibility: "visible" });
    tl.to({}, { duration: totalSec });
    return tl;
  }

  gsap.set(lines, { autoAlpha: 1 });
  gsap.set(allChars, { yPercent: -103, opacity: 1, visibility: "visible" });

  let cursor = 0.25;

  for (const line of lines) {
    const chars = [...line.querySelectorAll(".wrapped-drop-text__char")];
    if (!chars.length) {
      if (import.meta.env.DEV) {
        console.warn("[wrapped] intro line missing char cells:", line);
      }
      continue;
    }

    tl.to(
      chars,
      {
        yPercent: 0,
        duration: DROP_CHAR_DURATION,
        stagger: DROP_CHAR_STAGGER,
        ease: DROP_CHAR_EASE
      },
      cursor
    );

    cursor += DROP_CHAR_DURATION + chars.length * DROP_CHAR_STAGGER + INTRO_LINE_GAP;
  }

  return padTimeline(tl, totalSec);
}

/** Hero slides — header fades in, key type drops from above with bounce. */
function buildHeroDropTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const beats = collectBeats(rootEl);
  const dropEls = [...rootEl.querySelectorAll("[data-wrapped-drop]")];
  const fadeBeats = beats.filter((el) => !el.hasAttribute("data-wrapped-drop") && !dropEls.includes(el));
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });
  const allTargets = [...fadeBeats, ...dropEls];

  if (!allTargets.length) {
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    resetMotionTargets(allTargets);
    tl.to({}, { duration: totalSec });
    return tl;
  }

  let cursor = CARD_ENTER_DELAY;

  for (const el of fadeBeats) {
    cursor = animateFadeBeat(tl, el, cursor);
  }

  for (const el of dropEls) {
    cursor = animateDropBeat(tl, el, cursor);
  }

  return padTimeline(tl, totalSec);
}

/** Slide 7 — top-3 stack bars race, then #1 surges ahead; podium pulses on win. */
function buildBarRaceTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const beats = collectBeats(rootEl).filter(
    (el) => !el.closest("[data-wrapped-race-stack]")
  );
  const raceSegments = [...rootEl.querySelectorAll("[data-wrapped-race-segment]")].slice(0, 3);
  const podiumItems = [...rootEl.querySelectorAll("[data-podium-rank]")];
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });

  if (reduced) {
    resetMotionTargets([...beats, ...raceSegments, ...podiumItems]);
    raceSegments.forEach((seg) => {
      const flex = parseFloat(seg.dataset.raceFlex) || 1;
      gsap.set(seg, { flexGrow: flex });
      const valEl = seg.querySelector("[data-race-count]");
      const target = parseInt(valEl?.dataset.raceCount ?? "0", 10);
      if (valEl && target > 0) {
        valEl.textContent = target.toLocaleString();
      }
    });
    tl.to({}, { duration: totalSec });
    return tl;
  }

  let cursor = CARD_ENTER_DELAY;

  for (const el of beats) {
    cursor = animateFadeBeat(tl, el, cursor, { fromY: 12 });
  }

  const raceStart = cursor + 0.08;
  const raceDuration = Math.min(3.6, totalSec * 0.52);
  const surgeAt = raceStart + raceDuration * 0.68;
  const surgeDuration = raceDuration * 0.32;

  gsap.set(podiumItems, { opacity: 0, y: 18, scale: 0.92 });
  tl.to(
    podiumItems,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.42,
      stagger: 0.07,
      ease: "back.out(1.2)"
    },
    raceStart - 0.05
  );

  if (raceSegments.length) {
    const finals = raceSegments.map((seg) => parseFloat(seg.dataset.raceFlex) || 1);
    const flex2 = finals[1] ?? finals[0] * 0.7;
    const flex3 = finals[2] ?? finals[0] * 0.5;

    raceSegments.forEach((seg, index) => {
      const finalFlex = finals[index] ?? 1;
      gsap.set(seg, { flexGrow: 0.01, opacity: 1 });

      let interimFlex = finalFlex;
      if (index === 0 && raceSegments.length >= 2) {
        interimFlex = Math.max(flex2 * 0.94, finalFlex * 0.72);
      } else if (index === 1) {
        interimFlex = flex2;
      } else if (index === 2) {
        interimFlex = flex3 * 0.96;
      }

      tl.to(
        seg,
        {
          flexGrow: interimFlex,
          duration: raceDuration * 0.68,
          ease: "power2.out"
        },
        raceStart
      );

      if (index === 0) {
        tl.to(
          seg,
          {
            flexGrow: finalFlex,
            duration: surgeDuration,
            ease: "power3.out"
          },
          surgeAt
        );
      } else {
        tl.to(
          seg,
          {
            flexGrow: finalFlex,
            duration: surgeDuration * 0.85,
            ease: "power2.out"
          },
          surgeAt + 0.04
        );
      }

      const valEl = seg.querySelector("[data-race-count]");
      const target = parseInt(valEl?.dataset.raceCount ?? "0", 10);
      if (valEl && target > 0) {
        const counter = { v: 0 };
        tl.to(
          counter,
          {
            v: target,
            duration: raceDuration,
            ease: "power1.out",
            onUpdate: () => {
              valEl.textContent = Math.round(counter.v).toLocaleString();
            }
          },
          raceStart
        );
      }
    });

    const leadPodium = rootEl.querySelector('[data-podium-rank="0"]');
    if (leadPodium) {
      tl.to(
        leadPodium,
        {
          scale: 1.1,
          duration: 0.22,
          ease: "power2.out"
        },
        surgeAt + surgeDuration * 0.35
      );
      tl.to(
        leadPodium,
        {
          scale: 1,
          duration: 0.35,
          ease: "elastic.out(1, 0.55)"
        },
        surgeAt + surgeDuration * 0.55
      );
    }
  }

  return padTimeline(tl, totalSec);
}

/**
 * Build a GSAP timeline for one slide's scene beats, padded to durationMs.
 */
export function createSlideBeatTimeline(
  rootEl,
  { slideIndex = 0, durationMs = 5500, template = "hero", onComplete } = {}
) {
  if (!rootEl) {
    return null;
  }

  const reduced = prefersReducedMotion();

  if (slideIndex === INTRO_DROP_SLIDE_INDEX) {
    return buildIntroDropTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  if (slideIndex === BAR_RACE_SLIDE_INDEX) {
    return buildBarRaceTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  if (HERO_DROP_SLIDE_INDICES.has(slideIndex)) {
    return buildHeroDropTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  return buildGenericTimeline(rootEl, { durationMs, template, onComplete, reduced });
}

/** Kill a timeline and clear refs safely. */
export function killSlideTimeline(timeline) {
  if (timeline) {
    timeline.kill();
  }
}
