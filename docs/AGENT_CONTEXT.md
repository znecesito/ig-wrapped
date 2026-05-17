# Agent context (rolling)

**Last updated:** 2026-05-16

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).

---

## Features shipped

**Non-Followers (`/`)** — User uploads two Instagram export JSON files (followers + following). The app `POST`s them to the backend and lists usernames the user follows who do not follow back, with profile links.

**Activity Heatmap (`/heatmap`)** — Client-only: user picks an exported folder; the app discovers activity/comment-related JSON, parses events, and shows calendar and weekday×hour heatmaps (with source toggles, timezone choice, and family/breakdown coloring). Implemented via `frontend/src/utils/commentHeatmap.js` and `HeatmapPage.jsx`.

**Social Graph (`/social-graph`)** — Client-only: user picks an exported folder; the app discovers social-interaction style files, parses per-account counts by source category, can infer the owner username from `personal_information` (with optional manual override), and shows top accounts with bar visualization and self-exclusion from rankings. Implemented via `frontend/src/utils/socialInteractionGraph.js` and `SocialGraphPage.jsx`.

**Messages (`/messages`)** — Client-only: user picks an exported folder; the app discovers `your_instagram_activity/messages/inbox/**/message_*.json`, merges per-thread counts across message parts, supports username detection/override for participant-aware labels, and shows top threads as a heat-colored bar list. Implemented via `frontend/src/utils/messageFrequency.js` and `MessagesPage.jsx`.

**Most used words (`/most-used-words`)** — Client-only: user picks an exported folder; the app discovers media JSON under `your_instagram_activity/media` (posts, archived posts, reels, stories), extracts captions with mojibake repair where needed, filters stopwords, and shows separate Top word and Top hashtag bar lists. Implemented via `frontend/src/utils/mostUsedWords.js` and `MostUsedWordsPage.jsx`.

**Wrapped (`/wrapped`)** — Client-only recap after an export folder is loaded in context. **Delivery:** a **vertical scroller** of **ten 9:16 story cards** (`.wrapped-story__scroller`, scroll-snap, `IntersectionObserver` for active dot + reveal animations); Prev/Next call `scrollIntoView`, arrow keys work too—intended for **screenshots** or camera-roll “Add to Story.” Each card uses light IG-style glass (Playfair/Outfit), safe-area insets on `.wrapped-card__safe`, and a per-slide accent (`wrappedThemes.js`). Slide order: intro → span → activity → **likes** → **comments** → **story interactions** → DMs → profile searches → privacy → teaser. Content: activity date span; activity card with four main totals (comments, likes, media, story interactions — heatmap family semantics) plus busiest weekday/hour and an **activity-style stack** chart; three social leaderboards (likes → comments on others’ content → story interactions), each with rank list + accent-tinted stack + a witty **body quip** right after the chart (`bodyQuip` on `WrappedSlideLayout`); top DM threads with the same pattern; **Profile searches** (`logged_information/recent_searches/profile_searches.json`); **Privacy** (local-only reminder); Phase B teaser. Footer on data slides: merged **ig-wrapped** brand + short stat for #1 (no separate watermark). Orchestration: `wrappedData.js` (`loadWrappedBaseline`, `formatActivityBreakdownForWrapped`); profile searches via `profileSearches.js`; colors: `wrappedPalette.js` (heatmap family colors on activity stacks, `stackColorFromAccent` on leaderboards). Leaderboards cap `WRAPPED_SOCIAL_LEADERBOARD_LIMIT` = 4. UI split: `WrappedPage.jsx`, `wrappedSlideContent.jsx`, `WrappedSlideChrome.jsx`, Wrapped block in `styles.css`. Reads or fills `heatmapCache`, `socialGraphCache`, and `messagesCache` like other tabs. **Date range wording:** span comes from parsed activity event timestamps in this export (not a full calendar-year guarantee and not every file in the zip).

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

- `frontend/src/pages/WrappedPage.jsx`, `wrappedSlideContent.jsx`, `components/WrappedSlideChrome.jsx`, `utils/wrappedData.js`, `wrappedPalette.js`, `wrappedThemes.js`, `profileSearches.js`, `styles.css` — Wrapped: vertical 9:16 card column, scroll-snap + observers, activity/leaderboard stack charts, body quips after charts, merged footer stat, hybrid palette.
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
