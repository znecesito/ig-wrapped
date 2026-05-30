import { SLIDE_ACCENTS } from "../lib/tokens.js";
import { getSlideTheme } from "./wrappedThemes.js";

export { SLIDE_ACCENTS };

const STACK_BLEND_PCT = [86, 70, 56, 44, 38];

export function getSlideAccent(cardIndex) {
  const theme = getSlideTheme(cardIndex);
  return getSlideAccentForTheme(theme);
}

export function getSlideAccentForTheme(theme) {
  return SLIDE_ACCENTS[theme] ?? SLIDE_ACCENTS.intro;
}

/** Muted stack segment from slide accent (leaderboard slides). */
export function stackColorFromAccent(accent, rankIndex) {
  const pct = STACK_BLEND_PCT[rankIndex] ?? STACK_BLEND_PCT[STACK_BLEND_PCT.length - 1];
  return `color-mix(in srgb, ${accent} ${pct}%, #ffffff)`;
}
