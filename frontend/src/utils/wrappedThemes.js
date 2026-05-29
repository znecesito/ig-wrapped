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
  "teaser",
  "privacy"
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

/** Phase F — hero (0,1,8), data (2–7), trust (9). */
export const SLIDE_TEMPLATE_BY_INDEX = [
  "hero",
  "hero",
  "data",
  "data",
  "data",
  "data",
  "data",
  "data",
  "hero",
  "trust"
];

export function getSlideTemplate(cardIndex) {
  return SLIDE_TEMPLATE_BY_INDEX[cardIndex] ?? "data";
}

export function getSlideTheme(cardIndex) {
  return SLIDE_THEMES[cardIndex] ?? "intro";
}

export function getSlideThemeStyle(theme) {
  return SLIDE_THEME_VARS[theme] ?? SLIDE_THEME_VARS.intro;
}

/**
 * Card fill for story player (Phase F). Lobby/legacy deck still use CARD_SURFACE_BG.
 */
export function getCardSurfaceStyle(theme, template, { playerMode = false } = {}) {
  const vars = getSlideThemeStyle(theme);
  if (!playerMode) {
    return { ...vars, background: CARD_SURFACE_BG };
  }

  const accent = SLIDE_ACCENTS[theme] ?? SLIDE_ACCENTS.intro;

  if (template === "hero") {
    return {
      ...vars,
      "--slide-fg": "#ffffff",
      "--slide-fg-muted": "rgb(255 255 255 / 0.78)",
      "--slide-fg-subtle": "rgb(255 255 255 / 0.58)",
      "--slide-glass-border": "rgb(255 255 255 / 0.22)",
      background: `linear-gradient(
        152deg,
        ${accent} 0%,
        color-mix(in srgb, ${accent} 70%, #7c3aed) 46%,
        color-mix(in srgb, ${accent} 52%, #312e81) 100%
      )`
    };
  }

  if (template === "trust") {
    return {
      ...vars,
      background: `linear-gradient(
        168deg,
        #f8fafc 0%,
        color-mix(in srgb, ${accent} 10%, #e2e8f0) 52%,
        #f1f5f9 100%
      )`
    };
  }

  return {
    ...vars,
    background: `linear-gradient(
      175deg,
      #ffffff 0%,
      color-mix(in srgb, ${accent} 12%, #fff) 38%,
      color-mix(in srgb, ${accent} 20%, #fdf2f8) 100%
    )`
  };
}
