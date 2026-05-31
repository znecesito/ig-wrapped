/** Story player — slide count and auto-advance timing (Phase E). */

export const WRAPPED_CARD_COUNT = 11;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** Auto-advance duration per slide (ms). Last slide uses 0 — hold until tap. */
export const WRAPPED_SLIDE_DURATIONS_MS = [
  5500, // intro
  5500, // personality %
  6500, // activity breakdown
  5500, // peak rhythm
  5000, // streak
  5000, // busiest day
  5500, // social spotlight
  6000, // social ranking
  5500, // inbox personality
  5500, // DM you vs them (busiest thread)
  0 // privacy — last slide, no auto-advance
];

export function getSlideDurationMs(slideIndex) {
  return WRAPPED_SLIDE_DURATIONS_MS[slideIndex] ?? 5500;
}
