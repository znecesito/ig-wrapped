import { SLIDE_ACCENTS } from "../../lib/tokens.js";
import { getSlideTheme } from "../../utils/wrappedThemes.js";

/** Static copy + theme for landing preview cards (slides 0–5). */
export const LANDING_PREVIEW_SLIDES = [
  {
    index: 0,
    title: "Intro",
    copy: "Your export year, @handle, and a quick read on how active you were.",
    teaser: "intro"
  },
  {
    index: 1,
    title: "Activity",
    copy: "A color-coded stack of likes, comments, stories, and more — with your total count.",
    teaser: "activity"
  },
  {
    index: 2,
    title: "Your rhythm",
    copy: "Which weekday you show up most, plus a persona title pulled from your patterns.",
    teaser: "rhythm"
  },
  {
    index: 3,
    title: "People",
    copy: "Rank-over-time chart for the accounts that rose to the top in your export.",
    teaser: "people"
  },
  {
    index: 4,
    title: "Inbox",
    copy: "Notification-style stack, then stats for your busiest DM thread.",
    teaser: "inbox"
  },
  {
    index: 5,
    title: "Privacy",
    copy: "A straight reminder: everything ran locally — nothing left your device.",
    teaser: "privacy"
  }
];

export function getPreviewSlideAccent(index) {
  const theme = getSlideTheme(index);
  return SLIDE_ACCENTS[theme] ?? SLIDE_ACCENTS.intro;
}
