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

/** CSS variables for card shell (accent, tint, glass). */
export const SLIDE_THEME_VARS = {
  intro: {
    ...SLIDE_GLASS,
    "--slide-accent": "#e11d48",
    "--slide-tint": "rgba(225, 29, 72, 0.11)"
  },
  span: {
    ...SLIDE_GLASS,
    "--slide-accent": "#6366f1",
    "--slide-tint": "rgba(99, 102, 241, 0.1)"
  },
  activity: {
    ...SLIDE_GLASS,
    "--slide-accent": "#ea580c",
    "--slide-tint": "rgba(234, 88, 12, 0.1)"
  },
  likes: {
    ...SLIDE_GLASS,
    "--slide-accent": "#db2777",
    "--slide-tint": "rgba(219, 39, 119, 0.1)"
  },
  comments: {
    ...SLIDE_GLASS,
    "--slide-accent": "#7c3aed",
    "--slide-tint": "rgba(124, 58, 237, 0.1)"
  },
  stories: {
    ...SLIDE_GLASS,
    "--slide-accent": "#d97706",
    "--slide-tint": "rgba(217, 119, 6, 0.1)"
  },
  dms: {
    ...SLIDE_GLASS,
    "--slide-accent": "#4f46e5",
    "--slide-tint": "rgba(79, 70, 229, 0.1)"
  },
  search: {
    ...SLIDE_GLASS,
    "--slide-accent": "#0d9488",
    "--slide-tint": "rgba(13, 148, 136, 0.1)"
  },
  privacy: {
    ...SLIDE_GLASS,
    "--slide-accent": "#475569",
    "--slide-tint": "rgba(71, 85, 105, 0.09)"
  },
  teaser: {
    ...SLIDE_GLASS,
    "--slide-accent": "#94a3b8",
    "--slide-tint": "rgba(148, 163, 184, 0.12)"
  }
};

export const CARD_SURFACE_BG =
  "linear-gradient(165deg, var(--slide-glass) 0%, color-mix(in srgb, var(--slide-tint) 35%, white) 100%)";

export function getSlideTheme(cardIndex) {
  return SLIDE_THEMES[cardIndex] ?? "intro";
}

export function getSlideThemeStyle(theme) {
  return SLIDE_THEME_VARS[theme] ?? SLIDE_THEME_VARS.intro;
}
