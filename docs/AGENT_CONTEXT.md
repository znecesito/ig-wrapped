# Agent context (rolling)

**Last updated:** 2026-05-13

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).

---

## Features shipped

**Non-Followers (`/`)** — User uploads two Instagram export JSON files (followers + following). The app `POST`s them to the backend and lists usernames the user follows who do not follow back, with profile links.

**Activity Heatmap (`/heatmap`)** — Client-only: user picks an exported folder; the app discovers activity/comment-related JSON, parses events, and shows calendar and weekday×hour heatmaps (with source toggles, timezone choice, and family/breakdown coloring). Implemented via `frontend/src/utils/commentHeatmap.js` and `HeatmapPage.jsx`.

**Social Graph (`/social-graph`)** — Client-only: user picks an exported folder; the app discovers social-interaction style files, parses per-account counts by source category, can infer the owner username from `personal_information` (with optional manual override), and shows top accounts with bar visualization and self-exclusion from rankings. Implemented via `frontend/src/utils/socialInteractionGraph.js` and `SocialGraphPage.jsx`.

**Messages (`/messages`)** — Client-only: user picks an exported folder; the app discovers `your_instagram_activity/messages/inbox/**/message_*.json`, merges per-thread counts across message parts, supports username detection/override for participant-aware labels, and shows top threads as a heat-colored bar list. Implemented via `frontend/src/utils/messageFrequency.js` and `MessagesPage.jsx`.

**Most used words (`/most-used-words`)** — Client-only: user picks an exported folder; the app discovers media JSON under `your_instagram_activity/media` (posts, archived posts, reels, stories), extracts captions with mojibake repair where needed, filters stopwords, and shows separate Top word and Top hashtag bar lists. Implemented via `frontend/src/utils/mostUsedWords.js` and `MostUsedWordsPage.jsx`.

**Wrapped (`/wrapped`)** — Client-only story view after an export folder is loaded in context: intro; activity date span; activity card with four main totals (comments, likes, media, story interactions — heatmap family semantics) plus busiest weekday/hour; **Your most liked creators** (top accounts merged from liked-post + liked-comment sources only, with a playful footer); top DM threads with a footer for the #1 thread; **Profile searches** card (`logged_information/recent_searches/profile_searches.json`); **Privacy** card after the fun slides; Phase B teaser for creator insights. Slide order: … → DMs → profile searches → privacy → teaser. Orchestration: `frontend/src/utils/wrappedData.js` (`loadWrappedBaseline`, `formatActivityBreakdownForWrapped`), `frontend/src/utils/profileSearches.js`; likes leaderboard uses `buildTopInteractions` with the likes category source ids from `getSocialCategories()`. Reads or fills `heatmapCache`, `socialGraphCache`, and `messagesCache` like other tabs. **Date range wording:** span comes from parsed activity event timestamps in this export (not a full calendar-year guarantee and not every file in the zip).

---

## Hosting and CI/CD (shipped 2026-05-12)

- **Frontend** deployed on **Vercel** (static Vite build, root directory `frontend`). SPA rewrites via `frontend/vercel.json`.
- **Backend** deployed on **Render** web service (root directory `backend`, `npm start`). Listens on `process.env.PORT || 4000`.
- `VITE_API_URL` env var (set in Vercel dashboard) tells the frontend where to `POST /upload`. Baked in at build time; redeploy frontend after changing.
- `frontend/.env.example` documents the env var for local dev.
- `App.jsx` uses `import.meta.env.VITE_API_URL ?? "http://localhost:4000/upload"` so local dev works without any `.env` file.
- GitHub Actions workflow `.github/workflows/frontend-ci.yml` runs `npm ci && npm run build` on PRs touching `frontend/**`.
- Backend exposes `GET /health` for smoke tests; `cors()` allows cross-origin requests from the Vercel origin.

---

## Key files touched recently

- `frontend/src/pages/WrappedPage.jsx`, `frontend/src/utils/wrappedData.js`, `frontend/src/utils/profileSearches.js` — Wrapped route, baseline loader, family-level activity breakdown, most-liked-creators (`buildTopInteractions` + likes source ids), profile search parser.
- `frontend/src/App.jsx` — `VITE_API_URL` env-var integration (was hardcoded `localhost:4000`).
- `frontend/.env.example` — new file documenting `VITE_API_URL`.
- `frontend/vercel.json` — new file; SPA catch-all rewrite.
- `.github/workflows/frontend-ci.yml` — new file; PR build gate.
- `README.md` — deploy docs, env-var table.

---

## Known gaps / next ideas (optional)

- Expand or harden parsers as Instagram export shapes change; keep client and server parser behavior aligned where both touch the same export types.
- Any new visualization should follow existing CSS and "no new heavy chart deps" unless the project explicitly adds one.
- Optional: user-editable stopword list for Most used words.
- Consider adding a backend health-check CI step or uptime monitor for Render.

---

## Template (for future updates)

Copy this block when refreshing the doc after a milestone:

```markdown
**Last updated:** YYYY-MM-DD

## Features shipped
- ...

## Key files touched recently
- ...

## Known gaps / next ideas
- ...
```
