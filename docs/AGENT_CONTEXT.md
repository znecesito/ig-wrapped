# Agent context (rolling)

**Last updated:** 2026-05-28

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).

---

## Product focus (shipped UI)

The live app is **Wrapped-only**: nav shows **Wrapped** and **How to export** only. [`App.jsx`](../frontend/src/App.jsx) renders `WrappedPage` or `GuidePage`; [`resolveRoute`](../frontend/src/config/features.js) sends `/`, `/heatmap`, `/messages`, and other legacy paths to **`/wrapped`**.

**Wrapped (`/wrapped`)** — Client-only Instagram recap after the user loads an export:

- **Ingest:** [`ExportPicker`](../frontend/src/components/ExportPicker.jsx) — **Choose ZIP** (Instagram `.zip`, JSON entries unzipped in-browser via **fflate**) or **Choose folder** (`webkitdirectory`). [`exportIngest.js`](../frontend/src/utils/exportIngest.js) normalizes to `File[]` with `webkitRelativePath`; warns above ~200MB ZIP, hard cap ~600MB. State in [`ExportDataContext`](../frontend/src/context/ExportDataContext.jsx) (`loadExport`, progress, errors).
- **Onboarding:** [`ExportGuide`](../frontend/src/components/ExportGuide.jsx) on empty Wrapped + [`GuidePage`](../frontend/src/pages/GuidePage.jsx) at `/guide` — Phone (6 steps) and Desktop (5 steps) tabs share parallel structure: Accounts Center entry → set up export (account / destination / JSON / date range) → email-preference heads-up → begin download (notification with subject "Your Meta information download is ready", re-login, Download button) → Choose ZIP (with an "uncompress / Choose folder" substep). All US spelling ("Center"). Inline screenshots load from [`frontend/public/export-guide/`](../frontend/public/export-guide/); a missing `<img>` hides its `<figure>` via `onError`, so the guide renders fine before assets land. Screenshot widths use `clamp(220px, 55%, 360px)` (`75%` cap for the wide success shot) so they scale to a percentage of the guide column. Full slot list: [`docs/export-guide-images.md`](export-guide-images.md).
- **Story UI:** Ten **9:16** cards in a vertical scroller (scroll-snap, Prev/Next, dots, keyboard). **Sharing:** hint to **screenshot** any card for Stories — **no** programmatic Save/download (removed after experiments with `html-to-image` and a dedicated 1080×1920 export frame; neither matched on-screen layout well enough for MVP).
- **Slides:** intro → activity span → activity (family stacks + busiest time) → likes → comments → story interactions → DMs → profile searches → privacy → teaser. Leaderboards capped at `WRAPPED_SOCIAL_LEADERBOARD_LIMIT` (4). Footer merges brand + #1 stat on data slides.
- **Podium UI:** [`WrappedAvatarPodium.jsx`](../frontend/src/components/WrappedAvatarPodium.jsx) — `.wrapped-podium__face` (circle, clips photo/initials); `.wrapped-podium__badge` (rank) positioned outside the face. Leaderboard slides: CSS `:has(.wrapped-leaderboard)` adds padding and `overflow: visible` on card/body so badges are not clipped by deck subheading or left edge.
- **Data:** `wrappedData.js` (`loadWrappedBaseline`) reuses/fills heatmap, social graph, and messages caches. Span wording uses timestamps in the loaded export, not a guaranteed calendar year.
- **Privacy copy:** Export not uploaded for Wrapped; local browser only.

**Legacy analysis pages** (`HeatmapPage`, `SocialGraphPage`, `MessagesPage`, `MostUsedWordsPage`, Non-Followers) remain in the repo but are **not imported or routed** in `App.jsx`. Parsers in `frontend/src/utils/` are still used by Wrapped.

---

## Hosting and CI/CD

- **Frontend:** Vercel (root `frontend`, Vite → `dist`). **`main`** → production. Feature branches / PRs → preview URLs (no second Vercel project needed).
- **Active feature branch (Tailwind):** `feat/tailwind-foundation` — foundation + partial slide shell migration; visuals intentionally unchanged until later phases.
- **Backend:** Render optional (`backend`, `npm start`, `GET /health`). Not required for Wrapped.
- **CI:** `.github/workflows/frontend-ci.yml` — `npm ci && npm run build` on PRs touching `frontend/**`.
- **SPA:** `frontend/vercel.json` rewrites to `index.html`.

---

## Key files touched recently

- **Tailwind phase C (partial):** slides 0, 1, 8, 9 in `wrappedSlideContent.jsx` use `wrappedSlideClasses.js` (hero, body, bullets, code, footer links in quips). Remaining slides: activity, leaderboards, searches.
- **Tailwind phase B (card shell):** `WrappedSlideChrome.jsx` + `wrappedThemes.js` (`SLIDE_THEME_VARS`) — glass 9:16 card, tint overlay, themes, reveal animations in `tailwind.css`; leaderboard overflow via `has-[.wrapped-leaderboard]`.
- **Tailwind phase A (deck):** [`WrappedStoryDeck.jsx`](../frontend/src/components/WrappedStoryDeck.jsx) — prev/next, dots, viewport, scroller.
- `frontend/src/components/ExportGuide.jsx` — full phone + desktop rewrite: substep outline (2a/2b/…), explicit "select your Instagram account", standalone email-preference step with screenshot, "Begin the download process" parent step with notification + download-button screenshots, Choose ZIP / uncompress substep with screenshots, US "Center" spelling, inline `<GuideShot>` figures with `onError` graceful-hide.
- `frontend/src/styles.css` — `.export-guide__shot img` width switched to `clamp(220px, 55%, 360px)` (`clamp(260px, 75%, 520px)` for `--wide`) so screenshots scale by percentage rather than fixed pixels.
- `frontend/src/utils/exportIngest.js`, `README.md` — Centre → Center copy fix.
- `frontend/public/export-guide/{phone,desktop}/` — drop folder for guide screenshots (`.gitkeep` placeholders; full slot list in `docs/export-guide-images.md`).
- `frontend/src/pages/WrappedPage.jsx` — Save slide / export host removed; screenshot share hint.
- `frontend/src/components/WrappedAvatarPodium.jsx` — face + badge DOM; rank badge outside circle.
- `frontend/package.json` — **`fflate`**, **Tailwind v4**, `clsx`, `tailwind-merge` (no `html-to-image`).
- `frontend/vite.config.js`, `frontend/src/tailwind.css`, `frontend/src/lib/{utils,tokens}.js` — Tailwind phase 1.
- Removed (not in tree): `WrappedSlideExport.jsx`, `wrappedCardCapture.js`, `saveWrappedCardImage.js`.

---

## Known gaps / next ideas (optional)

- **Blank dev page:** If `/wrapped` is white and the terminal shows `ENOENT ... html-to-image`, run `rm -rf frontend/node_modules/.vite` and restart `npm run dev` (stale Vite optimizer cache after removing `html-to-image`).
- **Save to PNG:** Only worth revisiting with a purpose-built export layout (or native share) — not by rasterizing the scroller card.
- Stream or worker-based unzip if very large exports OOM on mobile Safari.
- Re-enable or delete legacy page files and backend upload UI if product stays Wrapped-only long term.
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
