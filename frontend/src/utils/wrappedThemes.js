import { SLIDE_ACCENTS } from "../lib/tokens.js";

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

const SLIDE_GLASS = {
  "--slide-glass": "rgba(255, 255, 255, 0.72)",
  "--slide-glass-border": "rgba(255, 255, 255, 0.92)"
};

/** Per-theme tint alpha (visual parity with pre-token migration). */
const SLIDE_TINT_ALPHA = {
  intro: 0.11,
  privacy: 0.09,
  teaser: 0.12
};

const DEFAULT_SLIDE_TINT_ALPHA = 0.1;

function slideTintFromHex(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildSlideThemeVars(theme, accent) {
  const alpha = SLIDE_TINT_ALPHA[theme] ?? DEFAULT_SLIDE_TINT_ALPHA;
  return {
    ...SLIDE_GLASS,
    "--slide-accent": accent,
    "--slide-tint": slideTintFromHex(accent, alpha)
  };
}

/** CSS variables for card shell (accent, tint, glass). */
export const SLIDE_THEME_VARS = Object.fromEntries(
  Object.entries(SLIDE_ACCENTS).map(([theme, accent]) => [
    theme,
    buildSlideThemeVars(theme, accent)
  ])
);

export const CARD_SURFACE_BG =
  "linear-gradient(165deg, var(--slide-glass) 0%, color-mix(in srgb, var(--slide-tint) 35%, white) 100%)";

export function getSlideTheme(cardIndex) {
  return SLIDE_THEMES[cardIndex] ?? "intro";
}

export function getSlideThemeStyle(theme) {
  return SLIDE_THEME_VARS[theme] ?? SLIDE_THEME_VARS.intro;
}
