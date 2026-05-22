# Agent context (rolling)

**Last updated:** 2026-05-18

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).

---

## Product focus (shipped UI)

The live app is **Wrapped-only**: nav shows **Wrapped** and **How to export** only. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/`, `/heatmap`, `/messages`, and other legacy paths to **`/wrapped`**.

**Wrapped (`/wrapped`)** — Client-only Instagram recap after the user loads an export:

- **Ingest:** [`ExportPicker`](../frontend/src/components/ExportPicker.jsx) — **Choose ZIP** (Instagram `.zip`, JSON entries unzipped in-browser via **fflate**) or **Choose folder** (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js) normalizes to `File[]` with `webkitRelativePath`; warns above ~200MB ZIP, hard cap ~600MB. State in [`ExportDataContext`](../frontend/src/context/ExportDataContext.jsx) (`loadExport`, progress, errors).
- **Onboarding:** [`ExportGuide`](../frontend/src/components/ExportGuide.jsx) on empty Wrapped + [`GuidePage`](../frontend/src/pages/GuidePage.jsx) at `/guide` — Phone vs desktop tabs; recommends export **to device**, format **JSON**, date range **about 6 months to 1 year**.
- **Story UI:** Ten **9:16** cards in a vertical scroller (scroll-snap, Prev/Next, dots, keyboard). **Save slide** rasterizes the **visible card** at on-screen size (`devicePixelRatio`), then upscales to 1080×1920 (`wrappedCardCapture.js`); delivery via `saveWrappedCardImage.js` (Web Share / download / preview fallback). Components: `WrappedPage.jsx`, `wrappedSlideContent.jsx`, `WrappedSlideChrome.jsx`, `WrappedAvatarPodium.jsx`; themes/palette/avatars in `wrappedThemes.js`, `wrappedPalette.js`, `wrappedAvatars.js`.
- **Slides:** intro → activity span → activity (family stacks + busiest time) → likes → comments → story interactions → DMs → profile searches → privacy → teaser. Leaderboards capped at `WRAPPED_SOCIAL_LEADERBOARD_LIMIT` (4). Footer merges brand + #1 stat on data slides.
- **Data:** `wrappedData.js` (`loadWrappedBaseline`) reuses/fills heatmap, social graph, and messages caches. Span wording uses timestamps in the loaded export, not a guaranteed calendar year.
- **Privacy copy:** Export not uploaded for Wrapped; local browser only.

**Legacy analysis pages** (`HeatmapPage`, `SocialGraphPage`, `MessagesPage`, `MostUsedWordsPage`, Non-Followers) remain in the repo but are **not imported or routed** in `App.jsx`. Parsers in `frontend/src/utils/` are still used by Wrapped.

---

## Hosting and CI/CD

- **Frontend:** Vercel (root `frontend`, Vite → `dist`). Git push triggers deploy; PR preview builds.
- **Backend:** Render optional (`backend`, `npm start`, `GET /health`). Not required for Wrapped.
- **CI:** `.github/workflows/frontend-ci.yml` — `npm ci && npm run build` on PRs touching `frontend/**`.
- **SPA:** `frontend/vercel.json` rewrites to `index.html`.

---

## Key files touched recently

- `frontend/src/App.jsx`, `frontend/src/config/features.js` — Wrapped-only routes; `/` → `/wrapped`.
- `frontend/src/utils/exportIngest.js`, `frontend/src/components/ExportPicker.jsx`, `frontend/src/context/ExportDataContext.jsx` — ZIP + folder ingest.
- `frontend/src/components/ExportGuide.jsx`, `frontend/src/pages/GuidePage.jsx` — mobile/desktop export instructions (6mo–1yr range).
- `frontend/src/styles.css` — mobile nav (wrap, safe-area), export guide/picker styles.
- `frontend/package.json` — `fflate`, `html-to-image` dependencies.
- Wrapped stack: `WrappedPage.jsx`, `wrappedSlideContent.jsx`, `WrappedSlideChrome.jsx`, `wrappedData.js`, `wrappedPalette.js`, `wrappedThemes.js`, `wrappedAvatars.js`.

---

## Known gaps / next ideas (optional)

- Stream or worker-based unzip if very large exports OOM on mobile Safari.
- Re-enable or remove legacy page files and backend upload UI if product stays Wrapped-only long term.
- Backend health-check in CI or uptime monitor on Render if API is kept.
- Harden parsers as Instagram export JSON shapes change.

---

## Template (for future updates)

```markdown
**Last updated:** YYYY-MM-DD

## Product focus (shipped UI)
- ...

## Hosting and CI/CD
- ...

## Key files touched recently
- ...

## Known gaps / next ideas
- ...
```
