/** Story player — slide count and auto-advance timing (Phase E). */

export const WRAPPED_CARD_COUNT = 10;

export const WRAPPED_LAST_SLIDE_INDEX = WRAPPED_CARD_COUNT - 1;

/** Auto-advance duration per slide (ms). Last slide uses 0 — hold until tap. */
export const WRAPPED_SLIDE_DURATIONS_MS = [
  9000, // intro — char drop lines need room
  5500, // personality %
  6500, // activity breakdown
  5500, // peak rhythm
  5000, // streak
  5000, // busiest day
  5500, // social spotlight (#1 person)
  7500, // social ranking (bar race)
  5500, // DM you vs them (busiest thread)
  0 // privacy — last slide, no auto-advance
];

export function getSlideDurationMs(slideIndex) {
  return WRAPPED_SLIDE_DURATIONS_MS[slideIndex] ?? 5500;
}
