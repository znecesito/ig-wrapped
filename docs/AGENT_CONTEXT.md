# Agent context (rolling)

**Last updated:** 2026-05-04 (manual)

Short “where we left off” for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).

---

## Features shipped

**Non-Followers (`/`)** — User uploads two Instagram export JSON files (followers + following). The app `POST`s them to the backend and lists usernames the user follows who do not follow back, with profile links.

**Activity Heatmap (`/heatmap`)** — Client-only: user picks an exported folder; the app discovers activity/comment-related JSON, parses events, and shows calendar and weekday×hour heatmaps (with source toggles, timezone choice, and family/breakdown coloring). Implemented via `frontend/src/utils/commentHeatmap.js` and `HeatmapPage.jsx`.

**Social Graph (`/social-graph`)** — Client-only: user picks an exported folder; the app discovers social-interaction style files, parses per-account counts by source category, can infer the owner username from `personal_information` (with optional manual override), and shows top accounts with bar visualization and self-exclusion from rankings. Implemented via `frontend/src/utils/socialInteractionGraph.js` and `SocialGraphPage.jsx`.

---

## Key files touched recently (optional)

- `frontend/src/utils/socialInteractionGraph.js` — discovery, parsing, top interactions, self-username handling.
- `frontend/src/utils/commentHeatmap.js` — activity discovery, heatmap data, shared color helpers with the social graph.
- `frontend/src/pages/SocialGraphPage.jsx`, `HeatmapPage.jsx`, `App.jsx` — nav and page wiring.

---

## Known gaps / next ideas (optional)

- Expand or harden parsers as Instagram export shapes change; keep client and server parser behavior aligned where both touch the same export types.
- Any new visualization should follow existing CSS and “no new heavy chart deps” unless the project explicitly adds one.

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
