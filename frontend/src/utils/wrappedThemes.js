/** Per-slide accent tint (light glass cards). */
export const SLIDE_THEMES = [
  "intro",
  "span",
  "activity",
  "likes",
  "comments",
  "stories",
  "dms",
  "search",
  "privacy",
  "teaser"
];

export function getSlideTheme(cardIndex) {
  return SLIDE_THEMES[cardIndex] ?? "intro";
}
