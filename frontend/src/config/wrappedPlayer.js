/** Story player — slide count and auto-advance timing (Phase E). */

export const WRAPPED_CARD_COUNT = 9;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** Auto-advance duration per slide (ms). Last slide uses 0 — hold until tap. */
export const WRAPPED_SLIDE_DURATIONS_MS = [
  5000, // intro
  8000, // activity — sequential bar beats need room
  4500, // peak rhythm
  4000, // streak
  4000, // busiest day
  4500, // social spotlight (#1 person)
  6500, // social ranking (bar race)
  4500, // DM you vs them (busiest thread)
  0 // privacy — last slide, no auto-advance
];

export function getSlideDurationMs(slideIndex) {
  return WRAPPED_SLIDE_DURATIONS_MS[slideIndex] ?? 4500;
}
