import { getSlideTheme } from "./wrappedThemes.js";

/** Accent hex per slide — matches --slide-accent in styles.css */
export const SLIDE_ACCENTS = {
  intro: "#e11d48",
  span: "#6366f1",
  activity: "#ea580c",
  likes: "#db2777",
  comments: "#7c3aed",
  stories: "#d97706",
  dms: "#4f46e5",
  search: "#0d9488",
  privacy: "#475569",
  teaser: "#94a3b8"
};

const STACK_BLEND_PCT = [86, 70, 56, 44, 38];

export function getSlideAccent(cardIndex) {
  const theme = getSlideTheme(cardIndex);
  return SLIDE_ACCENTS[theme] ?? SLIDE_ACCENTS.intro;
}

/** Muted stack segment from slide accent (leaderboard slides). */
export function stackColorFromAccent(accent, rankIndex) {
  const pct = STACK_BLEND_PCT[rankIndex] ?? STACK_BLEND_PCT[STACK_BLEND_PCT.length - 1];
  return `color-mix(in srgb, ${accent} ${pct}%, #ffffff)`;
}
