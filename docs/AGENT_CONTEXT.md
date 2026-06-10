# Agent context (rolling)

**Last updated:** 2026-06-09 — **Wrapped SLC shipped on `main`** (6-slide deck, GSAP, soundtrack). **Next: Phase L (landing page)** on branch `feat/landing-page`.

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc). Spotify metrics research: [`spotify-wrapped-research.md`](spotify-wrapped-research.md).

---

## Branch and deploy

- **Production:** `main` — Wrapped player + lobby + 6 slides live on Vercel.
- **Active work:** **`feat/landing-page`** (branch from `main`) — conversion-focused landing at `/`; preview URL per push.
- **Vercel:** `main` → production; feature branches → **preview URL**. Test on preview, not only localhost.
- **Phase 0 (this session):** Docs only — no landing code until Phase L.

---

## Product focus (current vs planned)

### Shipped today (`main`)

The app is **Wrapped-first**: nav shows **Wrapped** and **How to export**. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/` and legacy paths to **`/wrapped`**.

Pre-load `/wrapped` duplicates marketing: title, lede, full `ExportGuide`, and `ExportPicker`. `/guide` is a near-duplicate of the guide + picker.

### Planned (Phase L–P — landing page)

| Route | Role |
|-------|------|
| **`/`** | **Landing** — hero, product preview, how-it-works, `#how-to` (embedded `ExportGuide`), FAQ, CTAs |
| **`/wrapped`** | **Product** — load export → lobby → player (no duplicate guide on empty state) |
| **`/guide`** | **Redirect** to `/#how-to` (preserve bookmarks) |

**Locked landing decisions (do not regress without sign-off):**

- **No export picker on landing** — picker stays on `/wrapped` only.
- **Hero CTAs:** Primary → `/wrapped` (“Get your Wrapped”). Secondary → `#how-to` (“How to get your export”).
- **Returning users** need a **fresh Meta export** for new activity; FAQ + how-to intro must say so (export links expire; re-request from Accounts Center).
- **Visual direction:** IG-native tokens (rose/purple, Outfit/Playfair) — continuity with Wrapped slides, not generic SaaS.
- **No fake global percentiles** on landing (same as product).
- **Nav:** Logo → `/`; anchor links on landing; “Get started” → `/wrapped`. Remove top-level **How to export** tab (becomes in-page `#how-to` section). **Data loaded / Clear** unchanged; nav hidden only in story player.

### Landing page sections (top → bottom)

1. **Hero** — outcome headline, PAS subhead, phone mock, primary + secondary CTA, trust strip (local only · no upload · no account · JSON only).
2. **What you get** — 6 teaser cards mapping to slides 0–5 (static mocks/screenshots; no live player on landing).
3. **How it works** — 3 steps: Request export → Load ZIP → Play Wrapped.
4. **`#how-to`** — existing [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) embedded; intro line for re-export; sticky CTA “Ready? Get your Wrapped” → `/wrapped`.
5. **FAQ** — export wait time, JSON vs HTML, screenshot sharing, Meta affiliation, re-export for new activity.
6. **Final CTA band** → `/wrapped`.

### Conversion frameworks (copy/design reference)

- **AIDA** — Attention (hero) → Interest (preview) → Desire (slide teasers) → Action (CTAs).
- **PAS** — Problem (no IG Wrapped) → Agitate (ZIP sits unused) → Solution (story cards in browser).
- **Fogg Behavior Model** — Export lowers *ability*; landing raises *motivation* (preview) and *prompt* (clear CTAs).
- **Trust-first** — Privacy above the fold; no account; client-only parsing.

---

## Export ingest (unchanged)

- [`ExportPicker.jsx`](../frontend/src/components/ExportPicker.jsx) — ZIP (fflate, JSON only) or folder (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js). State in [`ExportDataContext.jsx`](../frontend/src/context/ExportDataContext.jsx).
- [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) — reuse on landing at `#how-to`; [`GuidePage.jsx`](../frontend/src/pages/GuidePage.jsx) deprecated after redirect. Screenshots: [`docs/export-guide-images.md`](export-guide-images.md).

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

Content: [`wrappedSlideContent.jsx`](../frontend/src/pages/wrappedSlideContent.jsx). Insights: [`wrappedInsights.js`](../frontend/src/utils/wrappedInsights.js). People rank data: [`peopleRankHistory.js`](../frontend/src/utils/peopleRankHistory.js). Orchestration: [`wrappedData.js`](../frontend/src/utils/wrappedData.js).

### Motion (Phase H — shipped)

- **Library:** GSAP (`frontend/package.json`).
- **Timelines:** [`wrappedSlideTimeline.js`](../frontend/src/utils/wrappedSlideTimeline.js) — `createSlideBeatTimeline()` per slide index; padded to `WRAPPED_SLIDE_ANIM_DURATIONS_MS` (choreography only; advance is manual).
- **Progress bar:** timeline `onUpdate` + `gsap.quickSetter(scaleX)` — avoid React per-frame state + width CSS transitions (Safari jank).
- **Hooks:** `data-wrapped-beat`, `data-wrapped-beat-static`, `data-wrapped-beat-segment` on slide DOM.
- **People slide caveat:** Chart layout math lives in [`peopleRankChartLayout.js`](../frontend/src/utils/peopleRankChartLayout.js) (plain JS). **Do not** import React components into the timeline module — caused a blank-slide crash when imports were broken.
- **Reduced motion:** `prefers-reduced-motion: reduce` → static final states, no draw animation; soundtrack may start muted.

### Locked UX decisions — Wrapped (do not regress)

- **Start Wrapped** before player (not auto-enter on load).
- Warnings only in **lobby**; block Start until dismissed with layman “affects which slides”.
- **Tap to advance** — no auto-advance (`WRAPPED_AUTO_ADVANCE = false`); user controls pace.
- **Progress segments** track GSAP animation, not a wall-clock timer.
- **Hold** pauses GSAP + soundtrack (after hold delay); **quick tap** does not pause audio.
- **Tap only** for nav (no swipe left/right v1).
- **Tap left** = previous; **tap right** = next.
- **Nav hidden only in player**.
- **Visual direction:** **IG-native** (rose/purple gradients, bold type) — **not** Spotify 2025 B/W/lime clone.
- **No fake global percentiles**; export-scoped copy only.
- **No** `html-to-image` / scroller Save unless dedicated export layout returns.
- **Inbox quip** uses `SLIDE_INSIGHT_PUNCH_ON_DARK` (same bordered box as other hero slides).
- **Inbox stats:** large hero `%` with smaller descriptive label underneath (not one inline sentence).

---

## Success metrics (landing funnel)

**No analytics in repo today.** Document event names now; instrument in **Phase Q** (after landing ships).

Micro-conversion funnel (no signup):

```
landing_view → cta_primary_click → wrapped_view → export_loaded → wrapped_start → wrapped_complete
```

| Event | When to fire | Purpose |
|-------|----------------|---------|
| `landing_view` | User hits `/` | Top-of-funnel volume |
| `cta_primary_click` | Primary CTA → `/wrapped` | Intent to use product; prop `location`: `hero` \| `footer` \| `how_to_sticky` |
| `cta_secondary_click` | Secondary CTA → `#how-to` | Needs export instructions first |
| `how_to_section_view` | `#how-to` enters viewport (IntersectionObserver) | Scroll engagement without secondary click |
| `wrapped_view` | `/wrapped` loads | Entered product surface |
| `export_loaded` | `ExportDataContext` receives files | Hardest step — export + picker succeeded |
| `wrapped_start` | Lobby “Start Wrapped” clicked | Full conversion into experience |
| `wrapped_complete` | Last slide reached or exit after slide 5 | Depth (optional) |

**Privacy rules for analytics:** No export contents, usernames, or filenames in events. Prefer cookieless providers (e.g. Plausible, Vercel Analytics). Disclose in FAQ if a third-party script is added.

**Pre-launch QA:** Manual preview URL testing is enough for Phase L–P merge; analytics enables post-launch iteration.

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
| **K — Merge** | Done | `feat/tailwind-foundation` → `main` |

---

## Roadmap — landing page (Phase L–R)

### **Phase 0 — Documentation** ← **DONE (2026-06-09)**

Update `AGENT_CONTEXT.md`, `project.mdc`, `README.md`, `.cursorrules`. No code.

### **Phase L — Foundation (IA + routing)** ← **DONE (2026-06-09)**

- Branch `feat/landing-page` from `main`.
- `features.js`: `/` → landing; `/guide` → `/#how-to`; `/wrapped` unchanged when data loaded.
- `App.jsx`: `LandingPage` vs `WrappedPage`; nav skeleton.
- `LandingPage.jsx`: section placeholders (`hero`, `preview`, `steps`, `how-to`, `faq`, `cta`).
- `WrappedPage.jsx`: remove pre-load `ExportGuide` + marketing lede; focused load surface.
- `GuidePage.jsx`: redirect path; hash scroll to `#how-to`.
- **Exit:** `/` = shell; `/wrapped` = picker only; `/guide` → how-to; player/lobby unchanged.

### **Phase M — Hero + trust** ← **DONE (2026-06-09)**

- `LandingHero`: headline, subhead, phone mock, dual CTAs, trust strip.
- Nav: logo → `/`, anchors, “Get started” → `/wrapped`.

### **Phase N — Product preview** ← **DONE (2026-06-09)**

- “What you get” — 6 static teasers for slides 0–5.

### **Phase O — How it works + How to export** ← **NEXT**

- 3-step strip; `#how-to` wraps `ExportGuide`; re-export intro; sticky CTA → `/wrapped`.

### **Phase P — FAQ + polish**

- FAQ accordion; final CTA band; landing Tailwind layout; mobile + a11y pass.
- **Exit:** Full scroll journey; iPhone Safari on Vercel preview — **merge candidate**.

### **Phase Q — Analytics (optional, post-visual)**

- `track()` helper + provider; events from table above; no PII.

### **Phase R — Merge & ship**

- PR `feat/landing-page` → `main`; regression QA on Wrapped flow; docs → “shipped”.

### **Phase J — Extra slides (optional, parallel)**

- `mostUsedWords.js` → word slide; `past_instagram_insights`; avatars — see research doc.

---

## Key files (current + planned landing)

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
| Routing | `App.jsx`, `config/features.js` |
| Export UI | `ExportPicker.jsx`, `ExportGuide.jsx`, `pages/GuidePage.jsx` (deprecate) |
| **Landing (planned)** | `pages/LandingPage.jsx`, `components/landing/*` |
| Styling | `tailwind.css`, `styles.css` |
| Docs | `spotify-wrapped-research.md`, this file |

**Legacy / unused:** `WrappedStoryDeck.jsx` — pre–Phase E scroller; safe to delete. `WrappedSpotlightHero.jsx`, `WrappedAvatarPodium.jsx` — not in current 6-slide deck.

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

1. Read this file (landing phases L–R, locked decisions, metrics taxonomy).
2. Create branch **`feat/landing-page`** from `main`.
3. Default next work: **Phase O** (how-it-works + export guide) unless user reprioritizes.
4. User prefers **lowercase casual commit messages**; **do not push** unless asked.
5. Test on **real export** on iPhone Safari for Wrapped regressions after landing changes.
6. **`WRAPPED_CARD_COUNT === 6`** — do not assume 10 slides from older docs.
