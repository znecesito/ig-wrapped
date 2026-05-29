/** Story player — slide count and auto-advance timing (Phase E). */

export const WRAPPED_CARD_COUNT = 10;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** Auto-advance duration per slide (ms). Last slide uses 0 — hold until tap. */
export const WRAPPED_SLIDE_DURATIONS_MS = [
  5500, // intro
  5000, // span
  7000, // activity
  6500, // likes
  6500, // comments
  6500, // stories
  6500, // DMs
  6000, // searches
  7000, // feed personality
  0 // privacy — last slide, no auto-advance
];

export function getSlideDurationMs(slideIndex) {
  return WRAPPED_SLIDE_DURATIONS_MS[slideIndex] ?? 5500;
}
