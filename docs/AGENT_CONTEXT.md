# Agent context (rolling)

**Last updated:** 2026-06-03 — **6-slide deck**; **Phase H + I shipped** on `feat/tailwind-foundation`. **Next: Phase K (merge).**

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc). Spotify metrics research: [`spotify-wrapped-research.md`](spotify-wrapped-research.md).

---

## Branch and deploy

- **Active branch:** `feat/tailwind-foundation` (ahead of `main`; Tailwind + Wrapped player + **6-slide** deck + GSAP + soundtrack).
- **Vercel:** `main` → production; this branch → **preview URL** per push. Test `/wrapped` on preview, not only localhost.
- **Recent work (Jun 2026):** Phase I soundtrack (7-track shuffle, mute, spinning cover disc); tap-to-advance player; progress bar synced to GSAP (`scaleX` via `quickSetter`); IG-style chrome under progress (disc + mute + ×); hold-to-pause with delayed hold so taps don’t stop audio.

---

## Product focus (shipped UI)

The live app is **Wrapped-only**: nav shows **Wrapped** and **How to export** only. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/` and legacy paths to **`/wrapped`**.

### Export ingest (unchanged)

- [`ExportPicker.jsx`](../frontend/src/components/ExportPicker.jsx) — ZIP (fflate, JSON only) or folder (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js). State in [`ExportDataContext.jsx`](../frontend/src/context/ExportDataContext.jsx).
- [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) + [`GuidePage.jsx`](../frontend/src/pages/GuidePage.jsx) at `/guide`. Screenshots: [`docs/export-guide-images.md`](export-guide-images.md).

### Wrapped flow (after export loads)

1. **Lobby** — [`WrappedLobby.jsx`](../frontend/src/components/WrappedLobby.jsx): lede, handle/year, parse warnings with **layman impact** ([`parseWarningImpact.js`](../frontend/src/utils/parseWarningImpact.js)). **Start Wrapped** disabled until warnings acknowledged (checkbox). Soundtrack note in lede. No warnings → Start enabled immediately.
2. **Story player** — [`WrappedStoryPlayer.jsx`](../frontend/src/components/WrappedStoryPlayer.jsx): full-screen; nav hidden via [`WrappedPlayerContext.jsx`](../frontend/src/context/WrappedPlayerContext.jsx).
   - **Progress:** segments fill with slide GSAP choreography (`scaleX`, not auto-advance timer).
   - **Chrome (under progress, top-right):** spinning cover disc ([`WrappedMusicPlayer.jsx`](../frontend/src/components/WrappedMusicPlayer.jsx)), mute/unmute, × exit — IG-style icons, no filled button backgrounds (legacy `styles.css` override in `tailwind.css`).
   - **Nav:** tap right = next, tap left = back ([`WRAPPED_AUTO_ADVANCE = false`](../frontend/src/config/wrappedPlayer.js)).
   - **Hold** (~220ms delay): pauses GSAP + soundtrack; quick taps skip hold and keep music playing.
   - **Exit:** ×, **Escape**, swipe down → lobby.
   - Desktop: full-width backdrop (`bg-deck-viewport`), centered 9:16 card. [`WrappedSlideErrorBoundary.jsx`](../frontend/src/components/WrappedSlideErrorBoundary.jsx) per slide. Share via screenshot.

### Soundtrack (Phase I — shipped)

- **Start Wrapped** → shuffled **7-track** playlist ([`wrappedAudio.js`](../frontend/src/utils/wrappedAudio.js), [`wrappedAudioTracks.js`](../frontend/src/config/wrappedAudioTracks.js)).
- **Assets:** `frontend/public/audio/track-01.mp3` … `track-07.mp3`; covers in `frontend/public/audio/covers/` (see READMEs; `default.jpg` fallback).
- **UI:** disc spins when unmuted; mute = slashed speaker icon at reduced opacity; `localStorage` mute preference.
- No user Spotify/IG music taste; royalty-free loops only.

### Slides (index 0–5, **6 beats**)

| # | Slide | Template | Advance | Notes |
|---|--------|----------|---------|--------|
| 0 | **Intro** | hero | tap | Drop-down title + `@handle` + activity lede ([`DropDownText.jsx`](../frontend/src/components/DropDownText.jsx)) |
| 1 | **Activity** | data | tap | Family stack grows → total stat → quip in insight box |
| 2 | **Your rhythm** | hero | tap | [`RhythmDayFlip.jsx`](../frontend/src/components/RhythmDayFlip.jsx) weekday flip → persona title → quip box |
| 3 | **People** | data | tap | [`PeopleRankChart.jsx`](../frontend/src/components/PeopleRankChart.jsx) — rank lines + labels; [`buildPeopleQuip`](../frontend/src/utils/wrappedInsights.js) |
| 4 | **Inbox** | hero | tap | [`InboxNotificationStack.jsx`](../frontend/src/components/InboxNotificationStack.jsx) — stack + thread stats; [`buildDmBalanceSpotlight`](../frontend/src/utils/wrappedInsights.js) |
| 5 | **Privacy** | trust | tap | Local-only outro |

**Deck simplifications (2026-05):** Consolidated from earlier 10-slide prototype. Removed without product sign-off: feed personality slide, streak, busiest day, separate social spotlight + podium ranking, old standalone DM slide. Social + DM story now lives in **People** (rank chart) and **Inbox** (busiest thread).

Content: [`wrappedSlideContent.jsx`](../frontend/src/pages/wrappedSlideContent.jsx). Insights: [`wrappedInsights.js`](../frontend/src/utils/wrappedInsights.js). People rank data: [`peopleRankHistory.js`](../frontend/src/utils/peopleRankHistory.js). Orchestration: [`wrappedData.js`](../frontend/src/utils/wrappedData.js).

### Motion (Phase H — shipped)

- **Library:** GSAP (`frontend/package.json`).
- **Timelines:** [`wrappedSlideTimeline.js`](../frontend/src/utils/wrappedSlideTimeline.js) — `createSlideBeatTimeline()` per slide index; padded to `WRAPPED_SLIDE_ANIM_DURATIONS_MS` (choreography only; advance is manual).
- **Progress bar:** timeline `onUpdate` + `gsap.quickSetter(scaleX)` — avoid React per-frame state + width CSS transitions (Safari jank).
- **Hooks:** `data-wrapped-beat`, `data-wrapped-beat-static`, `data-wrapped-beat-segment` on slide DOM.
- **People slide caveat:** Chart layout math lives in [`peopleRankChartLayout.js`](../frontend/src/utils/peopleRankChartLayout.js) (plain JS). **Do not** import React components into the timeline module — caused a blank-slide crash when imports were broken.
- **Reduced motion:** `prefers-reduced-motion: reduce` → static final states, no draw animation; soundtrack may start muted.

### Locked UX decisions (do not regress)

- **Start Wrapped** before player (not auto-enter on load).
- Warnings only in **lobby**; block Start until dismissed with layman “affects which slides”.
- **Tap to advance** — no auto-advance (`WRAPPED_AUTO_ADVANCE = false`); user controls pace.
- **Progress segments** track GSAP animation, not a wall-clock timer.
- **Hold** pauses GSAP + soundtrack (after hold delay); **quick tap** does not pause audio.
- **Tap only** for nav (no swipe left/right v1).
- **Tap left** = previous; **tap right** = next.
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
| **I — Music** | Done | 7-track shuffle, mute, spinning disc chrome, hold-aware audio |

---

## Roadmap — next sessions

### **Phase J — Extra slides (optional)**

- `mostUsedWords.js` → word slide when export has captions/DM text.
- `past_instagram_insights` when file present.
- **Avatars:** `WrappedAvatarPodium` supports `row.imageUrl`; export has **your** `profile_photos.json` only — third-party faces need opt-in server/proxy (see research doc). **No Playwright by default.**

### **Phase K — Merge & ship** ← **NEXT**

- PR `feat/tailwind-foundation` → `main`.
- iPhone Safari: lobby → full playthrough → hold → mute → exit → screenshot test.
- Remove dead [`WrappedStoryDeck.jsx`](../frontend/src/components/WrappedStoryDeck.jsx) if still unused.
- Add per-track cover art (`covers/track-01.jpg` …) if desired beyond `default.jpg`.
- Update production.

---

## Key files (current)

| Area | Files |
|------|--------|
| Player | `WrappedStoryPlayer.jsx`, `WrappedMusicPlayer.jsx`, `WrappedLobby.jsx`, `WrappedPlayerContext.jsx`, `WrappedSlideErrorBoundary.jsx`, `config/wrappedPlayer.js` |
| Audio | `utils/wrappedAudio.js`, `config/wrappedAudioTracks.js`, `hooks/useWrappedAudioState.js`, `public/audio/` |
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
- **Blue button backgrounds in player:** Global `styles.css` `button` rule — player chrome uses unlayered overrides in `tailwind.css` (`.wrapped-player button.wrapped-player-chrome__btn`).
- **People slide blank (historical):** Caused by timeline importing layout helpers from React component file or missing `xForMonth`/`yForRank`. Fix: use `peopleRankChartLayout.js` only. Error boundary lets user tap past a broken slide.
- **DM / Inbox:** Uses **busiest thread** (`topThreads[0]`). If `selfUsername` missing, sender split may be empty → fallback copy.
- **Social rank chart:** Tracks accounts that ever hit top 5 in last 12 months of export; labels fade when rank drops below top 5 during the draw.
- Large ZIP OOM on mobile Safari — future worker/stream unzip.

---

## For the next session

1. Read this file + [`spotify-wrapped-research.md`](spotify-wrapped-research.md).
2. Confirm branch `feat/tailwind-foundation` and latest Vercel preview.
3. Default next work: **Phase K** (merge + QA) unless user reprioritizes.
4. User prefers **lowercase casual commit messages**; **do not push** unless asked.
5. Test on **real export** on iPhone Safari for player, audio, progress bar, and screenshot legibility.
6. **`WRAPPED_CARD_COUNT === 6`** — do not assume 10 slides from older docs.
