# Agent context (rolling)

**Last updated:** 2026-05-29

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc). Spotify metrics research: [`spotify-wrapped-research.md`](spotify-wrapped-research.md).

---

## Branch and deploy

- **Active branch:** `feat/tailwind-foundation` (ahead of `main`; Tailwind migration + Wrapped player + insights). Merge to `main` only after preview sign-off on real iPhone + export.
- **Vercel:** `main` → production; this branch → **preview URL** per push. Test `/wrapped` on preview, not only localhost.
- **Commits (recent):** Tailwind A–D, hybrid insights, **Phase E** story player + lobby, **Phase F** IG-native visual templates + player backdrop.

---

## Product focus (shipped UI)

The live app is **Wrapped-only**: nav shows **Wrapped** and **How to export** only. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/` and legacy paths to **`/wrapped`**.

### Export ingest (unchanged)

- [`ExportPicker.jsx`](../frontend/src/components/ExportPicker.jsx) — ZIP (fflate, JSON only) or folder (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js). State in [`ExportDataContext.jsx`](../frontend/src/context/ExportDataContext.jsx).
- [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) + [`GuidePage.jsx`](../frontend/src/pages/GuidePage.jsx) at `/guide`. Screenshots: [`docs/export-guide-images.md`](export-guide-images.md).

### Wrapped flow (after export loads)

1. **Lobby** — [`WrappedLobby.jsx`](../frontend/src/components/WrappedLobby.jsx): lede, handle/year, parse warnings with **layman impact** ([`parseWarningImpact.js`](../frontend/src/utils/parseWarningImpact.js)). **Start Wrapped** disabled until warnings acknowledged (checkbox). No warnings → Start enabled immediately.
2. **Story player** — [`WrappedStoryPlayer.jsx`](../frontend/src/components/WrappedStoryPlayer.jsx): full-screen; nav hidden via [`WrappedPlayerContext.jsx`](../frontend/src/context/WrappedPlayerContext.jsx). IG-style progress segments; **tap left/right**; **hold to pause**; **auto-advance** ([`config/wrappedPlayer.js`](../frontend/src/config/wrappedPlayer.js)); **last slide (personality) waits for tap**. Exit: **×**, **Escape**, **swipe down** → lobby. Desktop: full-width backdrop (`bg-deck-viewport`), centered 9:16 card. Share: screenshot hint in player.

### Ten slides (index 0–9)

| # | Slide | Notes |
|---|--------|--------|
| 0 | Intro | “Your feed, wrapped”, handle, export year |
| 1 | Activity span | Date range in export (not full IG history) |
| 2 | Activity | Mega total + dominant-family % punchline + stacks |
| 3 | Likes | Share headlines from `wrappedInsights` |
| 4 | Comments | Same |
| 5 | Story interactions | Same |
| 6 | DMs | Top threads (share lines **not** done yet — Phase G) |
| 7 | Profile searches | Share lines **not** done yet — Phase G |
| 8 | Privacy | Trust / local-only |
| 9 | Feed personality | Club-style persona + streak/busiest day bullets |

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

---

## Completed work (phases)

| Phase | Status | Summary |
|-------|--------|---------|
| **Tailwind 1** | Done | `tailwind.css`, `tokens.js`, `cn()`, Vite plugin |
| **A** | Done | Deck chrome → `WrappedStoryDeck.jsx` (legacy; superseded by player) |
| **B** | Done | Card shell → `WrappedSlideChrome.jsx`, `wrappedThemes.js` |
| **C** | Done | All slide content → `wrappedSlideClasses.js`, `wrappedSlideContent.jsx` |
| **D** | Done | Token sync, CSS cleanup, page/guide Tailwind classes |
| **Hybrid v1** | Done | `wrappedInsights.js`, Spotify-style copy on slides 0–2, 3–5, 9 |
| **E** | Done | Lobby + `WrappedStoryPlayer`, `WrappedPlayerContext`, `parseWarningImpact.js`, `wrappedPlayer.js` |
| **F** | Done | Hero/data/trust slide templates, per-slide player backdrop + grain, bold lobby CTA, pilot slides 0/2/9 + rollout 1–8 |

---

## Roadmap — immediate and remaining

### **Phase G — Metrics & copy completion** ← **NEXT**


### **Phase G — Metrics & copy completion**

- DMs (6) + profile searches (7): same **share headline** pattern as likes (`topPersonShareLines` in `wrappedInsights.js`).
- Dedupe slide title vs `bodyQuip` where redundant.
- Optional: personality slide **after** privacy (slide order 8/9 swap) if product prefers trust before finale.

---

### **Phase H — Scene choreography (Spotify-style presentation)**

**Not** small CSS fades only. Each slide = **timed scene** synced with `WRAPPED_SLIDE_DURATIONS_MS` in `wrappedPlayer.js`.

- Stagger: eyebrow → title → mega stat → punchline → chart (80–120ms steps).
- Hold-to-pause must freeze GSAP/timeline + progress bar.
- **Tool:** Prefer **GSAP** for timelines; optional **Lottie** on 2–3 hero slides if assets exist. **Not** 21st.dev drop-in (TS/shadcn assumptions). Approve one animation dep in `package.json`.
- User wants presentation quality comparable to Wrapped **beats**, within JS + Tailwind stack.

---

### **Phase I — Music layer**

- Unlock audio on **Start Wrapped** (user gesture).
- Short royalty-free loops per `FEED_PERSONALITIES` key (4–5 files in `public/audio/`).
- Mute toggle in player; hold pauses music.
- Default on vs muted-at-start: **TBD** (user leaned cinematic on Start; confirm in session).
- Cannot use user’s real Spotify/IG music taste.

---

### **Phase J — Extra data slides (optional)**

- `mostUsedWords.js` → word-personality slide when export has text.
- `past_instagram_insights` when file present.
- Busiest-day as dedicated card; month-by-month “phases” from `calendarDays`.
- May bump slide count or replace weak slides — coordinate with `WRAPPED_CARD_COUNT`.

---

### **Phase K — Merge & ship**

- PR `feat/tailwind-foundation` → `main`.
- iPhone Safari: lobby → full playthrough → hold → exit → screenshot test.
- Remove dead `WrappedStoryDeck.jsx` if unused.
- Update production; optional nav/guide Tailwind cleanup.

---

## Key files (current)

| Area | Files |
|------|--------|
| Player | `WrappedStoryPlayer.jsx`, `WrappedLobby.jsx`, `WrappedPlayerContext.jsx`, `config/wrappedPlayer.js` |
| Slides | `wrappedSlideContent.jsx`, `WrappedSlideChrome.jsx`, `wrappedSlideClasses.js`, `wrappedThemes.js` |
| Data | `wrappedData.js`, `wrappedInsights.js`, parsers in `utils/` |
| Styling | `tailwind.css` (tokens, player, card animations), `styles.css` (nav, guide, legacy) |
| Docs | `spotify-wrapped-research.md`, this file |

**Legacy / unused:** [`WrappedStoryDeck.jsx`](../frontend/src/components/WrappedStoryDeck.jsx) — pre–Phase E vertical scroller; safe to delete in Phase K cleanup.

---

## Known gaps / troubleshooting

- **Blank dev page:** `rm -rf frontend/node_modules/.vite` → restart `npm run dev` (stale cache after removed deps).
- **Save to PNG:** Only with purpose-built 1080×1920 layout — not rasterizing player DOM.
- Large ZIP OOM on mobile Safari — future worker/stream unzip.
- Parsers break when Meta changes export JSON — harden as needed.

---

## For the next session

1. Read this file + [`spotify-wrapped-research.md`](spotify-wrapped-research.md).
2. Confirm branch `feat/tailwind-foundation` and latest Vercel preview.
3. Implement **Phase G** unless user reprioritizes.
4. User prefers **lowercase casual commit messages**; **do not push** unless asked.
5. Test on **real export** on iPhone Safari for player + screenshot legibility.
