# Agent context (rolling)

**Last updated:** 2026-05-31 — **6-slide deck**; **Phase H (GSAP motion) shipped** on `feat/tailwind-foundation`. **Next: Phase I (music) or Phase K (merge to `main`).**

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc). Spotify metrics research: [`spotify-wrapped-research.md`](spotify-wrapped-research.md).

---

## Branch and deploy

- **Active branch:** `feat/tailwind-foundation` (ahead of `main`; Tailwind + Wrapped player + **6-slide** deck + GSAP timelines).
- **Vercel:** `main` → production; this branch → **preview URL** per push. Test `/wrapped` on preview, not only localhost.
- **Recent work (May 2026):** People rank-over-time chart slide; Inbox slide (notification stack + thread stats); GSAP scene choreography per slide; People chart crash fix (`peopleRankChartLayout.js` + `WrappedSlideErrorBoundary`); inbox stat copy + quip box styling.

---

## Product focus (shipped UI)

The live app is **Wrapped-only**: nav shows **Wrapped** and **How to export** only. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/` and legacy paths to **`/wrapped`**.

### Export ingest (unchanged)

- [`ExportPicker.jsx`](../frontend/src/components/ExportPicker.jsx) — ZIP (fflate, JSON only) or folder (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js). State in [`ExportDataContext.jsx`](../frontend/src/context/ExportDataContext.jsx).
- [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) + [`GuidePage.jsx`](../frontend/src/pages/GuidePage.jsx) at `/guide`. Screenshots: [`docs/export-guide-images.md`](export-guide-images.md).

### Wrapped flow (after export loads)

1. **Lobby** — [`WrappedLobby.jsx`](../frontend/src/components/WrappedLobby.jsx): lede, handle/year, parse warnings with **layman impact** ([`parseWarningImpact.js`](../frontend/src/utils/parseWarningImpact.js)). **Start Wrapped** disabled until warnings acknowledged (checkbox). No warnings → Start enabled immediately.
2. **Story player** — [`WrappedStoryPlayer.jsx`](../frontend/src/components/WrappedStoryPlayer.jsx): full-screen; nav hidden via [`WrappedPlayerContext.jsx`](../frontend/src/context/WrappedPlayerContext.jsx). IG-style progress segments; **tap left/right**; **hold to pause** (freezes GSAP timeline + progress); **auto-advance** ([`config/wrappedPlayer.js`](../frontend/src/config/wrappedPlayer.js)); **last slide (privacy) waits for tap**. Exit: **×**, **Escape**, **swipe down** → lobby. Desktop: full-width backdrop (`bg-deck-viewport`), centered 9:16 card. Each slide wrapped in [`WrappedSlideErrorBoundary.jsx`](../frontend/src/components/WrappedSlideErrorBoundary.jsx). Share: screenshot hint in player.

### Slides (index 0–5, **6 beats**)

| # | Slide | Template | Duration | Notes |
|---|--------|----------|----------|--------|
| 0 | **Intro** | hero | 5s | Drop-down title + `@handle` + activity lede ([`DropDownText.jsx`](../frontend/src/components/DropDownText.jsx)) |
| 1 | **Activity** | data | 8s | Family stack grows → total stat → quip in insight box |
| 2 | **Your rhythm** | hero | 7s | [`RhythmDayFlip.jsx`](../frontend/src/components/RhythmDayFlip.jsx) weekday flip → persona title → quip box |
| 3 | **People** | data | 12s | [`PeopleRankChart.jsx`](../frontend/src/components/PeopleRankChart.jsx) — 12-month rank lines; GSAP line draw + labels travel/fade when accounts drop out of top 5; [`buildPeopleQuip`](../frontend/src/utils/wrappedInsights.js) |
| 4 | **Inbox** | hero | 12s | [`InboxNotificationStack.jsx`](../frontend/src/components/InboxNotificationStack.jsx) — 3-card stack, iOS-style expand/reveal thread name; hero % stats count up; labels: “of all the messages in your inbox belong to this thread” / “of the messages in this thread are sent by you”; basketball quips via [`buildDmBalanceSpotlight`](../frontend/src/utils/wrappedInsights.js) |
| 5 | **Privacy** | trust | manual | Local-only outro (last slide, no auto-advance) |

**Deck simplifications (2026-05):** Consolidated from earlier 10-slide prototype. Removed without product sign-off: feed personality slide, streak, busiest day, separate social spotlight + podium ranking, old standalone DM slide. Social + DM story now lives in **People** (rank chart) and **Inbox** (busiest thread).

Content: [`wrappedSlideContent.jsx`](../frontend/src/pages/wrappedSlideContent.jsx). Insights: [`wrappedInsights.js`](../frontend/src/utils/wrappedInsights.js). People rank data: [`peopleRankHistory.js`](../frontend/src/utils/peopleRankHistory.js). Orchestration: [`wrappedData.js`](../frontend/src/utils/wrappedData.js).

### Motion (Phase H — shipped)

- **Library:** GSAP (`frontend/package.json`).
- **Timelines:** [`wrappedSlideTimeline.js`](../frontend/src/utils/wrappedSlideTimeline.js) — `createSlideBeatTimeline()` per slide index; padded to `WRAPPED_SLIDE_DURATIONS_MS`.
- **Hooks:** `data-wrapped-beat`, `data-wrapped-beat-static`, `data-wrapped-beat-segment` on slide DOM.
- **People slide caveat:** Chart layout math lives in [`peopleRankChartLayout.js`](../frontend/src/utils/peopleRankChartLayout.js) (plain JS). **Do not** import React components into the timeline module — caused a blank-slide crash when imports were broken.
- **Reduced motion:** `prefers-reduced-motion: reduce` → static final states, no draw animation.

### Locked UX decisions (do not regress)

- **Start Wrapped** before player (not auto-enter on load).
- Warnings only in **lobby**; block Start until dismissed with layman “affects which slides”.
- **Auto-advance always on**; hold pauses GSAP + progress bar.
- **Tap only** for nav (no swipe left/right v1).
- **Tap left** = previous.
- **Last slide** = no auto-advance.
- **Nav hidden only in player**; `/guide` keeps nav.
- **Visual direction:** **IG-native** (rose/purple gradients, bold type) — **not** Spotify 2025 B/W/lime clone.
- **No fake global percentiles**; export-scoped copy only.
- **No** `html-to-image` / scroller Save unless dedicated export layout returns.
- **Inbox quip** uses `SLIDE_INSIGHT_PUNCH_ON_DARK` (same bordered box as other hero slides).
- **Inbox stats:** large hero `%` with smaller descriptive label underneath (not one inline sentence).

---

## Completed work (phases)

| Phase | Status | Summary |
|-------|--------|---------|
| **Tailwind 1** | Done | `tailwind.css`, `tokens.js`, `cn()`, Vite plugin |
| **A–D** | Done | Deck chrome, card shell, slide content, token sync |
| **Hybrid v1** | Done | `wrappedInsights.js`, personality + share copy |
| **E** | Done | Lobby + `WrappedStoryPlayer`, `WrappedPlayerContext`, `parseWarningImpact.js`, `wrappedPlayer.js` |
| **F** | Done | Hero/data/trust templates, player backdrop + grain |
| **G + deck restructure** | Done | Merged social narrative; rhythm/activity beats; `data-wrapped-beat` hooks |
| **H** | Done | GSAP timelines per slide; intro drop; activity stack; rhythm reveal; people line draw; inbox stack choreography; percent count-up; hold-to-pause sync |
| **People + Inbox slides** | Done | Rank chart + notification stack slides replace older social/DM deck beats |

---

## Roadmap — next sessions

### **Phase I — Music layer** ← **NEXT (optional)**

- Unlock audio on **Start Wrapped** (user gesture).
- Short royalty-free loops keyed to rhythm/activity mood (4–5 files in `public/audio/`).
- Mute toggle in player; hold pauses music.
- Cannot use user’s real Spotify/IG music taste.

### **Phase J — Extra slides (optional)**

- `mostUsedWords.js` → word slide when export has captions/DM text.
- `past_instagram_insights` when file present.
- **Avatars:** `WrappedAvatarPodium` supports `row.imageUrl`; export has **your** `profile_photos.json` only — third-party faces need opt-in server/proxy (see research doc). **No Playwright by default.**

### **Phase K — Merge & ship**

- PR `feat/tailwind-foundation` → `main`.
- iPhone Safari: lobby → full playthrough → hold → exit → screenshot test.
- Remove dead [`WrappedStoryDeck.jsx`](../frontend/src/components/WrappedStoryDeck.jsx) if still unused.
- Update production.

---

## Key files (current)

| Area | Files |
|------|--------|
| Player | `WrappedStoryPlayer.jsx`, `WrappedLobby.jsx`, `WrappedPlayerContext.jsx`, `WrappedSlideErrorBoundary.jsx`, `config/wrappedPlayer.js` |
| Motion | `utils/wrappedSlideTimeline.js` |
| Slides | `pages/wrappedSlideContent.jsx`, `WrappedSlideChrome.jsx`, `components/wrappedSlideClasses.js`, `DropDownText.jsx` |
| People | `PeopleRankChart.jsx`, `utils/peopleRankHistory.js`, `utils/peopleRankChartLayout.js` |
| Inbox | `InboxNotificationStack.jsx`, `utils/messageFrequency.js` |
| Rhythm | `RhythmDayFlip.jsx` |
| Data | `wrappedData.js`, `wrappedInsights.js`, `wrappedExportWindow.js`, `socialInteractionGraph.js` |
| Styling | `tailwind.css`, `styles.css` |
| Docs | `spotify-wrapped-research.md`, this file |

**Legacy / unused:** `WrappedStoryDeck.jsx` — pre–Phase E scroller; delete in Phase K. `WrappedSpotlightHero.jsx`, `WrappedAvatarPodium.jsx` — still in repo; not used in current 6-slide deck.

---

## Known gaps / troubleshooting

- **Blank dev page:** `rm -rf frontend/node_modules/.vite` → restart `npm run dev`.
- **People slide blank (historical):** Caused by timeline importing layout helpers from React component file or missing `xForMonth`/`yForRank`. Fix: use `peopleRankChartLayout.js` only. Error boundary lets user tap past a broken slide.
- **DM / Inbox:** Uses **busiest thread** (`topThreads[0]`). If `selfUsername` missing, sender split may be empty → fallback copy.
- **Social rank chart:** Tracks accounts that ever hit top 5 in last 12 months of export; labels fade when rank drops below top 5 during the draw.
- Large ZIP OOM on mobile Safari — future worker/stream unzip.

---

## For the next session

1. Read this file + [`spotify-wrapped-research.md`](spotify-wrapped-research.md).
2. Confirm branch `feat/tailwind-foundation` and latest Vercel preview.
3. Default next work: **Phase I** (music) or **Phase K** (merge + QA) unless user reprioritizes.
4. User prefers **lowercase casual commit messages**; **do not push** unless asked.
5. Test on **real export** on iPhone Safari for player + screenshot legibility.
6. **`WRAPPED_CARD_COUNT === 6`** — do not assume 10 slides from older docs.
