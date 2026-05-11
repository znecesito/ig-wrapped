# Agent context (rolling)

**Last updated:** 2026-05-10 (manual)

Short “where we left off” for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).

---

## Features shipped

**Non-Followers (`/`)** — User uploads two Instagram export JSON files (followers + following). The app `POST`s them to the backend and lists usernames the user follows who do not follow back, with profile links.

**Activity Heatmap (`/heatmap`)** — Client-only: user picks an exported folder; the app discovers activity/comment-related JSON, parses events, and shows calendar and weekday×hour heatmaps (with source toggles, timezone choice, and family/breakdown coloring). Implemented via `frontend/src/utils/commentHeatmap.js` and `HeatmapPage.jsx`.

**Social Graph (`/social-graph`)** — Client-only: user picks an exported folder; the app discovers social-interaction style files, parses per-account counts by source category, can infer the owner username from `personal_information` (with optional manual override), and shows top accounts with bar visualization and self-exclusion from rankings. Implemented via `frontend/src/utils/socialInteractionGraph.js` and `SocialGraphPage.jsx`.

**Messages (`/messages`)** — Client-only: user picks an exported folder; the app discovers `your_instagram_activity/messages/inbox/**/message_*.json`, merges per-thread counts across message parts, supports username detection/override for participant-aware labels, and shows top threads as a heat-colored bar list. Implemented via `frontend/src/utils/messageFrequency.js` and `MessagesPage.jsx`.

**Most used words (`/most-used-words`)** — Client-only: user picks an exported folder; the app discovers media JSON under `your_instagram_activity/media` (posts, archived posts, reels, stories), extracts captions with mojibake repair where needed, filters stopwords, and shows separate Top word and Top hashtag bar lists. Implemented via `frontend/src/utils/mostUsedWords.js` and `MostUsedWordsPage.jsx`.

---

## Key files touched recently (optional)

- `frontend/src/utils/mostUsedWords.js` — media caption discovery, token/hashtag aggregation, encoding repair.
- `frontend/src/pages/MostUsedWordsPage.jsx`, `App.jsx` — route `/most-used-words` and nav.
- `frontend/src/utils/commentHeatmap.js`, `socialInteractionGraph.js` — extra export sources (e.g. reels comments, story questions/quizzes, posts/archive media for heatmap).
- `frontend/src/utils/messageFrequency.js` — inbox thread discovery and aggregation.
- `frontend/src/pages/MessagesPage.jsx`, `SocialGraphPage.jsx`, `HeatmapPage.jsx` — feature wiring.

---

## Known gaps / next ideas (optional)

- Expand or harden parsers as Instagram export shapes change; keep client and server parser behavior aligned where both touch the same export types.
- Any new visualization should follow existing CSS and “no new heavy chart deps” unless the project explicitly adds one.
- Optional: user-editable stopword list for Most used words.

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
