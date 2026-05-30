/** Story player — slide count and auto-advance timing (Phase E). */

export const WRAPPED_CARD_COUNT = 15;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** Auto-advance duration per slide (ms). Last slide uses 0 — hold until tap. */
export const WRAPPED_SLIDE_DURATIONS_MS = [
  5500, // intro
  5500, // personality %
  6500, // activity breakdown
  5500, // peak rhythm
  5000, // streak
  5000, // busiest day
  5500, // likes spotlight
  6000, // likes ranking
  5500, // comments spotlight
  6000, // comments ranking
  5500, // stories spotlight
  6000, // stories ranking
  5500, // DMs spotlight
  6000, // DMs ranking
  0 // privacy — last slide, no auto-advance
];

export function getSlideDurationMs(slideIndex) {
  return WRAPPED_SLIDE_DURATIONS_MS[slideIndex] ?? 5500;
}
