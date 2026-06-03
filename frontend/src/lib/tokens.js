/**
 * JS design tokens — canonical slide accents; keep @theme in tailwind.css in sync manually.
 */

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

export const colors = {
  brand: "#e11d48",
  brandMid: "#ec4899",
  ink: "#0f172a",
  muted: "#64748b",
  surface: "#f5f7fb",
  border: "#e2e8f0",
  slide: SLIDE_ACCENTS
};

export const fonts = {
  sans: '"Outfit", system-ui, sans-serif',
  display: '"Playfair Display", Georgia, serif'
};

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.875rem",
  card: "0.875rem",
  deck: "1rem",
  pill: "9999px"
};

export const shadows = {
  nav: "0 4px 12px rgba(0, 0, 0, 0.25)",
  deck: "0 2px 4px rgba(15, 23, 42, 0.04), 0 16px 40px -12px rgba(15, 23, 42, 0.14)",
  card:
    "0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 14px 26px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.55) inset"
};

export const typeScale = {
  xs: { size: "0.72rem", lineHeight: 1.25 },
  sm: { size: "0.82rem", lineHeight: 1.35 },
  base: { size: "1rem", lineHeight: 1.5 },
  lg: { size: "1.125rem", lineHeight: 1.4 },
  xl: { size: "1.25rem", lineHeight: 1.3 },
  "2xl": { size: "1.5rem", lineHeight: 1.25 },
  "3xl": { size: "1.875rem", lineHeight: 1.2 },
  "4xl": { size: "2.25rem", lineHeight: 1.15 },
  hero: { size: "2.75rem", lineHeight: 1.05 }
};

export const layout = {
  storyAspect: "9 / 16",
  frameMaxWidthPx: 420
};
