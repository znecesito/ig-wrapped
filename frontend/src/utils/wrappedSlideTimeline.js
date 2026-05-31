import gsap from "gsap";

/** Stagger order for scene beats (Phase H). */
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

export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/**
 * Build a GSAP timeline for one slide's scene beats, padded to durationMs.
 * Returns null when rootEl is missing.
 */
export function createSlideBeatTimeline(rootEl, { durationMs = 5500, template = "hero", onComplete } = {}) {
  if (!rootEl) {
    return null;
  }

  const beats = collectBeats(rootEl);
  const segments = [...rootEl.querySelectorAll("[data-wrapped-beat-segment]")];
  const totalSec = Math.max(0.5, durationMs / 1000);
  const reduced = prefersReducedMotion();
  const isTrust = template === "trust";

  const tl = gsap.timeline({
    paused: true,
    onComplete
  });

  const allTargets = [...beats, ...segments];
  if (!allTargets.length) {
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    gsap.set(allTargets, { opacity: 1, y: 0, scale: 1, scaleX: 1 });
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
    cursor += segments.length * SEGMENT_STAGGER + SEGMENT_DURATION * 0.5;
  }

  const animEnd = tl.duration();
  const hold = Math.max(0.4, totalSec - animEnd);
  tl.to({}, { duration: hold });

  return tl;
}

/** Kill a timeline and clear refs safely. */
export function killSlideTimeline(timeline) {
  if (timeline) {
    timeline.kill();
  }
}
