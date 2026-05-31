# Agent context (rolling)

**Last updated:** 2026-05-29 — **deck frozen at 10 slides**; **start Phase H in a fresh session** (read this file + research doc first).

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc). Spotify metrics research: [`spotify-wrapped-research.md`](spotify-wrapped-research.md).

---

## Branch and deploy

- **Active branch:** `feat/tailwind-foundation` (ahead of `main`; Tailwind + Wrapped player + deck restructure).
- **Vercel:** `main` → production; this branch → **preview URL** per push. Test `/wrapped` on preview, not only localhost.
- **Recent commits:** Phase E–F player/templates; consolidated social (merged likes/comments/stories); DM **you vs them** on busiest thread only; removed inbox-wide personality slide (redundant with slide 8).

---

## Product focus (shipped UI)

The live app is **Wrapped-only**: nav shows **Wrapped** and **How to export** only. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/` and legacy paths to **`/wrapped`**.

### Export ingest (unchanged)

- [`ExportPicker.jsx`](../frontend/src/components/ExportPicker.jsx) — ZIP (fflate, JSON only) or folder (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js). State in [`ExportDataContext.jsx`](../frontend/src/context/ExportDataContext.jsx).
- [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) + [`GuidePage.jsx`](../frontend/src/pages/GuidePage.jsx) at `/guide`. Screenshots: [`docs/export-guide-images.md`](export-guide-images.md).

### Wrapped flow (after export loads)

1. **Lobby** — [`WrappedLobby.jsx`](../frontend/src/components/WrappedLobby.jsx): lede, handle/year, parse warnings with **layman impact** ([`parseWarningImpact.js`](../frontend/src/utils/parseWarningImpact.js)). **Start Wrapped** disabled until warnings acknowledged (checkbox). No warnings → Start enabled immediately.
2. **Story player** — [`WrappedStoryPlayer.jsx`](../frontend/src/components/WrappedStoryPlayer.jsx): full-screen; nav hidden via [`WrappedPlayerContext.jsx`](../frontend/src/context/WrappedPlayerContext.jsx). IG-style progress segments; **tap left/right**; **hold to pause**; **auto-advance** ([`config/wrappedPlayer.js`](../frontend/src/config/wrappedPlayer.js)); **last slide (privacy) waits for tap**. Exit: **×**, **Escape**, **swipe down** → lobby. Desktop: full-width backdrop (`bg-deck-viewport`), centered 9:16 card. Share: screenshot hint in player.

### Slides (index 0–9, **10 beats**)

| # | Slide | Template | Notes |
|---|--------|----------|--------|
| 0 | Intro | hero | Year + `@handle` + activity count lede |
| 1 | Feed personality | hero | Dominant activity family % + club-style persona |
| 2 | Activity mix | data | Total activities + family stack; **365-day trim** when export span &gt; 1 year ([`wrappedExportWindow.js`](../frontend/src/utils/wrappedExportWindow.js)) |
| 3 | Your rhythm | hero | Peak weekday + hour persona + quip (`formatHour12`, full weekday names) |
| 4 | Longest streak | hero | Consecutive active days |
| 5 | Busiest day | hero | Max activities in one calendar day |
| 6 | **#1 person** | hero | Merged likes + comments + story taps; quip by **dominant type** per account ([`buildSocialSpotlight`](../frontend/src/utils/wrappedInsights.js)); [`WrappedSpotlightHero`](../frontend/src/components/WrappedSpotlightHero.jsx) |
| 7 | Top accounts | data | Merged social ranking ([`buildTopSocialCreatorsWithBreakdown`](../frontend/src/utils/socialInteractionGraph.js)); [`WrappedAvatarPodium`](../frontend/src/components/WrappedAvatarPodium.jsx) |
| 8 | **You vs them** | hero | **Busiest DM thread only** — % you sent vs others ([`buildDmBalanceSpotlight`](../frontend/src/utils/wrappedInsights.js)); sender from `sender_name` in message JSON |
| 9 | Privacy | trust | Local-only outro (last slide) |

**Removed from deck (do not re-add without product sign-off):** separate likes/comments/stories spotlight pairs; DM thread ranking slide; profile search slide; parasocial slide; **inbox-wide personality** slide (overlapped slide 8).

Content: [`wrappedSlideContent.jsx`](../frontend/src/pages/wrappedSlideContent.jsx). Insights: [`wrappedInsights.js`](../frontend/src/utils/wrappedInsights.js). Orchestration: [`wrappedData.js`](../frontend/src/utils/wrappedData.js).

### Locked UX decisions (do not regress)

- **Start Wrapped** before player (not auto-enter on load).
- Warnings only in **lobby**; block Start until dismissed with layman “affects which slides”.
- **Auto-advance always on**; hold pauses (Spotify-style).
- **Tap only** for nav (no swipe left/right v1).
- **Tap left** = previous.
- **Last slide** = no auto-advance.
- **Nav hidden only in player**; `/guide` keeps nav.
- **Visual direction:** **IG-native** (rose/purple gradients, bold type) — **not** Spotify 2025 B/W/lime clone.
- **No fake global percentiles**; export-scoped copy only.
- **No** `html-to-image` / scroller Save unless dedicated export layout returns.
- **One DM beat:** busiest-thread you vs them only (no aggregate inbox personality card).

---

## Completed work (phases)

| Phase | Status | Summary |
|-------|--------|---------|
| **Tailwind 1** | Done | `tailwind.css`, `tokens.js`, `cn()`, Vite plugin |
| **A–D** | Done | Deck chrome, card shell, slide content, token sync |
| **Hybrid v1** | Done | `wrappedInsights.js`, personality + share copy |
| **E** | Done | Lobby + `WrappedStoryPlayer`, `WrappedPlayerContext`, `parseWarningImpact.js`, `wrappedPlayer.js` |
| **F** | Done | Hero/data/trust templates, player backdrop + grain, `WrappedSpotlightHero` |
| **G + deck restructure** | Done | Merged social slides; DM you vs them; 365-day activity window; rhythm/streak/busiest-day beats; spotlight quips; `data-wrapped-beat` hooks for motion |

---

## Roadmap — immediate and remaining

### **Phase H — Scene choreography (Spotify-style presentation)** ← **NEXT (new session)**

**Goal:** Timed scene beats per slide, synced with `WRAPPED_SLIDE_DURATIONS_MS` in [`wrappedPlayer.js`](../frontend/src/config/wrappedPlayer.js) (10 entries).

- Stagger: eyebrow → title → hero (`data-wrapped-beat`) → stat → quip → chart/footer.
- **Hold-to-pause** must freeze GSAP timeline + progress bar (see [`WrappedStoryPlayer.jsx`](../frontend/src/components/WrappedStoryPlayer.jsx)).
- **Tool:** Prefer **GSAP** (one animation dep). Approve in `package.json` before adding.
- Hooks already on spotlight slides: `data-wrapped-beat="hero"`, `"stat"`, `"quip"`, `"footer"`, etc.
- **Do not** change slide count or copy unless user asks — motion only.

**Session start checklist:** Read this file → confirm `WRAPPED_CARD_COUNT === 10` → test one slide timeline → roll out to all indices.

---

### **Phase I — Music layer**

- Unlock audio on **Start Wrapped** (user gesture).
- Short royalty-free loops per `FEED_PERSONALITIES` key (4–5 files in `public/audio/`).
- Mute toggle in player; hold pauses music.
- Cannot use user’s real Spotify/IG music taste.

---

### **Phase J — Extra slides (optional)**

- `mostUsedWords.js` → word slide when export has captions/DM text.
- `past_instagram_insights` when file present.
- **Avatars:** `WrappedAvatarPodium` supports `row.imageUrl`; export has **your** `profile_photos.json` only — third-party faces need opt-in server/proxy (see research doc). **No Playwright by default.**

---

### **Phase K — Merge & ship**

- PR `feat/tailwind-foundation` → `main`.
- iPhone Safari: lobby → full playthrough → hold → exit → screenshot test.
- Remove dead [`WrappedStoryDeck.jsx`](../frontend/src/components/WrappedStoryDeck.jsx) if unused.
- Update production.

---

## Key files (current)

| Area | Files |
|------|--------|
| Player | `WrappedStoryPlayer.jsx`, `WrappedLobby.jsx`, `WrappedPlayerContext.jsx`, `config/wrappedPlayer.js` |
| Slides | `wrappedSlideContent.jsx`, `WrappedSlideChrome.jsx`, `wrappedSlideClasses.js`, `wrappedThemes.js`, `WrappedSpotlightHero.jsx` |
| Data | `wrappedData.js`, `wrappedInsights.js`, `wrappedExportWindow.js`, `socialInteractionGraph.js`, `messageFrequency.js` |
| Styling | `tailwind.css`, `styles.css` |
| Docs | `spotify-wrapped-research.md`, this file |

**Legacy / unused:** `WrappedStoryDeck.jsx` — pre–Phase E scroller; delete in Phase K.

---

## Known gaps / troubleshooting

- **Blank dev page:** `rm -rf frontend/node_modules/.vite` → restart `npm run dev`.
- **DM you vs them:** Uses **busiest thread** (`topThreads[0]`). If `selfUsername` missing, sender split may be empty → fallback copy.
- **Social leaderboards:** Not date-filtered (no per-event timestamps in social JSON); activity heatmap **is** trimmed to last 365 days when span &gt; 1 year.
- Large ZIP OOM on mobile Safari — future worker/stream unzip.

---

## For the next session (Phase H)

1. Read this file + [`spotify-wrapped-research.md`](spotify-wrapped-research.md).
2. Confirm branch `feat/tailwind-foundation` and latest Vercel preview.
3. Implement **Phase H** motion only unless user reprioritizes.
4. User prefers **lowercase casual commit messages**; **do not push** unless asked.
5. Test on **real export** on iPhone Safari for player + screenshot legibility.
