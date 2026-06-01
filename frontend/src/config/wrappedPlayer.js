/** Story player — slide count and auto-advance timing (Phase E). */

export const WRAPPED_CARD_COUNT = 6;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** Auto-advance duration per slide (ms). Last slide uses 0 — hold until tap. */
export const WRAPPED_SLIDE_DURATIONS_MS = [
  5000, // intro
  8000, // activity
  7000, // rhythm
  18000, // people rank chart (+9s admire time after animation)
  4500, // DM you vs them
  0 // privacy — last slide, no auto-advance
];

export function getSlideDurationMs(slideIndex) {
  return WRAPPED_SLIDE_DURATIONS_MS[slideIndex] ?? 4500;
}
