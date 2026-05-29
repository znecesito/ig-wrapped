/** Shared Tailwind classes for Wrapped slide content (phase C). */

/** Page title (Wrapped / guide) */
export const PAGE_TITLE =
  "mb-1 font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold tracking-tight text-ink";

export const WRAPPED_PAGE_LEDE = "max-w-[42rem] leading-[1.55] text-muted";

export const WRAPPED_PAGE_STATUS = "mt-3 text-muted";

export const WRAPPED_PAGE_WARNINGS_HEADER =
  "mb-1.5 flex items-center justify-between gap-3";

export const WRAPPED_PAGE_WARNINGS_TITLE = "m-0 text-base";

export const WRAPPED_PAGE_DISMISS =
  "rounded-pill bg-muted px-[0.65rem] py-[0.35rem] text-[0.8rem] text-white";

export const GUIDE_PAGE_LEDE = "mb-4 max-w-[40rem] leading-[1.55] text-muted";

export const GUIDE_PAGE_PICKER = "mt-4";

/** Slide chrome hooks — keep class names for :has() selectors in WrappedSlideChrome */
export const SLIDE_DECK = "slide-deck";

export const SLIDE_BODY = "m-0 text-[0.8rem] leading-[1.3] text-muted";

export const SLIDE_HERO =
  "m-0 font-display text-[clamp(1.45rem,6.5vw,1.85rem)] font-bold leading-[1.08] tracking-tight text-ink break-words";

export const SLIDE_HERO_COMPACT =
  "m-0 font-display text-[clamp(1.05rem,4.5vw,1.32rem)] font-bold leading-[1.08] tracking-tight text-ink break-words";

export const SLIDE_BULLET_LIST =
  "m-0 list-disc space-y-[0.28rem] pl-4 text-[0.8rem] leading-[1.3] text-slate-700";

export const SLIDE_CODE =
  "rounded-md border border-white/75 bg-white/55 px-1.5 py-0.5 text-[0.85em] font-semibold text-ink";

export const SLIDE_FOOTER_LINK =
  "font-bold text-[#be185d] no-underline hover:text-[var(--slide-accent)] hover:underline";

export const SLIDE_MEGA_STAT =
  "m-0 font-display text-[clamp(2rem,9vw,2.65rem)] font-extrabold leading-[0.95] tracking-tight text-ink";

export const SLIDE_MEGA_STAT_SM =
  "m-0 font-display text-[clamp(1.55rem,7vw,2rem)] font-extrabold leading-[0.95] tracking-tight text-ink";

export const SLIDE_MEGA_LABEL =
  "m-0 text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.07em] text-muted";

/** Spotify-style one-liner under a mega stat */
export const SLIDE_INSIGHT_PUNCH =
  "m-0 rounded-[10px] border border-[color-mix(in_srgb,var(--slide-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--slide-accent)_10%,white)] px-2.5 py-2 text-center text-[0.78rem] font-bold leading-snug text-ink";

export const SLIDE_PERSONALITY_TITLE =
  "m-0 font-display text-[clamp(1.35rem,6vw,1.75rem)] font-extrabold leading-tight tracking-tight text-ink";

export const SLIDE_PERSONALITY_EMOJI = "m-0 text-[2.25rem] leading-none";

export const SLIDE_SHARE_HEADLINE =
  "m-0 text-center text-[0.82rem] font-extrabold leading-snug text-[var(--slide-accent)]";

export const SLIDE_STATS_INLINE =
  "m-0 grid list-none grid-cols-2 gap-1 rounded-[10px] border border-white/80 bg-white/45 px-2 py-1.5";

export const SLIDE_STAT_LABEL = "text-[0.58rem] text-muted";

export const SLIDE_STAT_VALUE =
  "font-display text-[0.92rem] font-bold text-ink";

export const ACTIVITY_STACK =
  "flex h-[min(10.5rem,24vh)] min-h-[6.5rem] flex-col overflow-hidden rounded-[10px] border border-white/75 shadow-[inset_0_1px_3px_rgba(15,23,42,0.06)]";

export const ACTIVITY_STACK_SEGMENT =
  "flex min-h-5 items-center justify-between gap-1.5 px-[0.45rem] py-[0.3rem] text-ink";

export const ACTIVITY_STACK_LABEL =
  "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.64rem] font-extrabold uppercase tracking-wide";

export const ACTIVITY_STACK_LINK =
  "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-inherit no-underline hover:text-ink hover:underline";

export const ACTIVITY_STACK_VAL =
  "shrink-0 text-[0.76rem] font-black tabular-nums";

/** Profile searches slide — ranks 2–4 list */
export const SEARCH_RANK_REST =
  "m-0 mt-0.5 flex list-none flex-col gap-[0.15rem] p-0";

export const SEARCH_RANK_ROW =
  "grid grid-cols-[1rem_1fr_auto] items-baseline gap-[0.3rem] text-[0.72rem]";

export const SEARCH_RANK_NUM = "min-w-4 text-[0.7rem] font-extrabold text-muted";

export const SEARCH_RANK_NAME =
  "overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[#be185d]";

export const SEARCH_RANK_COUNT =
  "font-bold tabular-nums text-[0.72rem] text-muted";

/** Leaderboard block (slides 3–6) — keep .wrapped-leaderboard for :has() in slide chrome */
export const LEADERBOARD =
  "wrapped-leaderboard flex w-full flex-col gap-[0.45rem] px-2 pt-2.5";

export const PODIUM =
  "m-0 flex list-none items-end justify-center gap-[clamp(0.35rem,2.5vw,0.65rem)] overflow-visible p-0";

export const PODIUM_ITEM =
  "flex max-w-[4.5rem] min-w-0 flex-1 flex-col items-center gap-[0.22rem] overflow-visible";

export const PODIUM_ITEM_LEAD = "max-w-[5.25rem]";

export const PODIUM_AVATAR_LINK = "block overflow-visible leading-none no-underline";

export const PODIUM_AVATAR =
  "relative block size-[clamp(2.35rem,11vw,2.85rem)] overflow-visible";

export const PODIUM_AVATAR_LEAD = "size-[clamp(2.85rem,13vw,3.45rem)]";

export const PODIUM_FACE =
  "relative flex size-full items-center justify-center overflow-hidden rounded-full border-2 border-white/[0.92] shadow-[0_2px_8px_rgba(15,23,42,0.12)]";

export const PODIUM_FACE_LEAD =
  "border-[2.5px] border-[var(--slide-accent)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--slide-accent)_28%,transparent)]";

export const PODIUM_IMG = "absolute inset-0 size-full object-cover";

export const PODIUM_INITIALS =
  "z-0 text-[clamp(0.85rem,3.8vw,1rem)] font-extrabold tracking-wide text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]";

export const PODIUM_INITIALS_LEAD = "text-[clamp(1rem,4.5vw,1.15rem)]";

export const PODIUM_BADGE =
  "absolute -left-[0.2rem] -top-[0.2rem] z-[2] flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-pill border-[1.5px] border-white bg-[var(--slide-accent)] px-[0.2rem] text-[0.58rem] font-extrabold leading-none text-white shadow-[0_1px_3px_rgba(15,23,42,0.15)]";

export const PODIUM_COUNT =
  "max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[0.62rem] font-bold tabular-nums leading-snug text-muted";

export const PODIUM_COUNT_LEAD = "text-[0.68rem] text-ink";
