# Social Graph — consolidated plan (with self-account exclusion)

## Scope

- Third tab **Social Graph** ([`frontend/src/App.jsx`](frontend/src/App.jsx)), page [`frontend/src/pages/SocialGraphPage.jsx`](frontend/src/pages/SocialGraphPage.jsx), util [`frontend/src/utils/socialInteractionGraph.js`](frontend/src/utils/socialInteractionGraph.js).
- Bar chart of **top 5** accounts by **Media Owner** from comment JSON under `your_instagram_activity/comments`, with category/subcategory toggles; IG-themed CSS bars (no chart library).

---

## Self-account detection and filtering (new)

### Goal

Exclude interactions where the **media owner** is the **same person as the user**, so comments on the user’s own posts/reels do not inflate “who you interact with.”

### Data source

- Standard Instagram data export includes  
  `personal_information/personal_information/personal_information.json`  
  (nested folder repeated twice; match by **relative path suffix** on the `FileList` from `webkitdirectory`, not only exact string equality, to tolerate OS path quirks).

### Parsing

- Read JSON and resolve:  
  `profile_user.string_map_data.Username.value`  
  (same pattern as Media Owner: object under `string_map_data` with a `value` string).
- **Normalize** for comparison: trim; compare **case-insensitive** (Instagram usernames are treated as case-insensitive for handles).

### UX

1. **Up-front copy** (same folder picker as today): short, friendly note that the user should select the **root** of their Instagram export so the app can find both `your_instagram_activity` and `personal_information`. This matches how Meta ships exports and stays local-only (no upload to a server). If product polish later prefers not to promise a path, we can soften copy to “full export folder” without naming paths.

2. **After folder read**:
   - If username extracted: show a confirmation line, e.g. **We have detected your username is `username`.** (use actual detected value).
   - If file missing, unreadable, or value absent: show an optional **manual username** text field (trimmed, same normalization). User must enter handle **without** `@` for consistency with export values.
   - Allow **override**: even when auto-detected, optional edit field can let the user correct a wrong parse (implementation choice: show inline edit or “not you?” link).

3. **Filtering**: During aggregation (or when merging counts into `buildTopInteractions`), **drop** any row where `normalize(mediaOwner) === normalize(selfUsername)` when `selfUsername` is non-empty. If self is unknown (user skipped manual entry), either show a warning that self-comments may be included, or require confirmation—prefer **clear warning** rather than blocking, unless we require username for graph accuracy.

### Implementation notes

- **Two-phase parse**: (a) scan `FileList` for `personal_information.json` at the known relative path; parse async. (b) Run existing comment discovery/parse with **excludeSelf** / `selfUsername` passed into `parseSocialInteractionCounts` or a wrapper that filters inside `extractMediaOwnerUsername` pipeline (skip before incrementing counts).
- **State**: `detectedUsername`, `manualUsername`, `effectiveSelfUsername` (manual overrides detected when set).
- **Tests**: Manual—folder with mock JSON; verify own handle never appears in top 5 when commenting on self.

---

## Original behavior (unchanged except filtering above)

- Discovery under `your_instagram_activity/comments`: `post_comments_*.json` (array root), `hype.json` → `comments_story_comments`.
- Toggles: **Comments** category + **Post comments** / **Story comments** sub-sources (for `hype.json` / `comments_story_comments`—these are **story** comments, not reels; label in UI must say **Story comments**, not “Reels comments”).
- Reuse path helpers / descriptors pattern already in [`socialInteractionGraph.js`](frontend/src/utils/socialInteractionGraph.js).

---

## Files likely touched for self-exclusion

| File | Change |
|------|--------|
| [`frontend/src/utils/socialInteractionGraph.js`](frontend/src/utils/socialInteractionGraph.js) | `parsePersonalInformationUsername(files)`, filter in parse/top builder given `selfUsername`. |
| [`frontend/src/pages/SocialGraphPage.jsx`](frontend/src/pages/SocialGraphPage.jsx) | Folder hint copy; detection banner; manual input; pass self into parse. |
| [`frontend/src/styles.css`](frontend/src/styles.css) | Optional styles for detection alert / username field. |

---

## Optional todos (execution)

- [ ] Add `parsePersonalInformationUsername(fileList)` + path matching for nested `personal_information.json`.
- [ ] Wire Social Graph page: hint text, detected message, manual fallback, effective username state.
- [ ] Pass `selfUsername` into counting pipeline; normalize and exclude self from aggregates and top-5.
- [ ] Empty/missing self: warning copy when graph runs without a resolved username.
