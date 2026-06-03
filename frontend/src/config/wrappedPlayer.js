/** Story player — slide count, animation timing, and advance behavior (Phase E). */

export const WRAPPED_CARD_COUNT = 6;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** When false, each slide waits for tap (right) before advancing. */
export const WRAPPED_AUTO_ADVANCE = false;

/**
 * GSAP beat timeline length per slide (ms). Used for choreography only when auto-advance is off.
 */
export const WRAPPED_SLIDE_ANIM_DURATIONS_MS = [
  5000, // intro
  8000, // activity
  7000, // rhythm
  12000, // people rank chart
  12000, // inbox
  3200 // privacy outro
];

/** @deprecated Use WRAPPED_SLIDE_ANIM_DURATIONS_MS; kept for callers expecting advance durations. */
export const WRAPPED_SLIDE_DURATIONS_MS = WRAPPED_SLIDE_ANIM_DURATIONS_MS.map((ms) =>
  WRAPPED_AUTO_ADVANCE ? ms : 0
);

export function getSlideAnimDurationMs(slideIndex) {
  return WRAPPED_SLIDE_ANIM_DURATIONS_MS[slideIndex] ?? 4500;
}

/** Advance timeout (0 = manual tap only when WRAPPED_AUTO_ADVANCE is false). */
export function getSlideDurationMs(slideIndex) {
  if (!WRAPPED_AUTO_ADVANCE) {
    return 0;
  }
  return WRAPPED_SLIDE_ANIM_DURATIONS_MS[slideIndex] ?? 4500;
}
