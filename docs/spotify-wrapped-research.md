# Spotify Wrapped research (for ig-wrapped)

**Sources (May 2026):** [Spotify 2025 Wrapped UX announcement](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/), [2024 Wrapped media kit](https://newsroom.spotify.com/media-kit/2024-wrapped/), [Music Ally 2024 breakdown](https://musically.com/2024/12/04/spotify-wrapped-2024-is-live-top-artists-albums-tracks-and-more/).

**Handoff:** Full phase roadmap and shipped state → [`AGENT_CONTEXT.md`](AGENT_CONTEXT.md). **Phase K (merge) = next session.**

Visual reference (Spotify marketing): high-contrast collage, oversized year, bold outlines, grain texture, one stat per beat, share cards per datapoint. **Product visual direction for ig-wrapped is IG-native** (gradients, rose/purple, bold type) — borrow Spotify’s **narrative structure and motion**, not their brand palette.

---

## Why people share Wrapped

| Mechanism | Spotify example | IG Wrapped analogue |
|-----------|-----------------|---------------------|
| **Identity** | “This is *my* year” | Handle + export year on intro |
| **One big number** | Minutes listened | Total activities; inbox thread share % |
| **Status** | Top 1% of listeners for artist X | Top accounts in rank chart; “#1 in *your* export” (honest, not global percentile) |
| **Relationship** | Top artist / song | People rank chart + busiest DM thread (Inbox slide) |
| **Surprise** | Musical phases, Clubs | Rhythm persona, activity family mix |
| **Streak / dedication** | Longest listening streak | *(removed from current 6-slide deck; data still in insights)* |
| **Share artifact** | Per-stat share cards | Screenshot-friendly 9:16 cards in story player |

**Do not fake** global percentiles (no IG API). Use **self-relative** framing.

---

## Shipped UX (player + lobby)

- **Lobby:** warnings + layman impact → **Start Wrapped** (soundtrack note in lede)
- **Player:** full-screen; GSAP-synced progress segments; tap L/R; hold pause (GSAP + audio, delayed hold); tap-to-advance (no timer); top chrome: spinning cover disc + mute + ×; exit to lobby
- See `WrappedLobby.jsx`, `WrappedStoryPlayer.jsx`, `WrappedMusicPlayer.jsx`, `config/wrappedPlayer.js`, `utils/wrappedAudio.js` — **`WRAPPED_CARD_COUNT = 6`**

---

## Slide order (current, index 0–5)

| # | Beat | Template | Advance | Archetype |
|---|------|----------|---------|-----------|
| 0 | Intro | hero | tap | Identity |
| 1 | Activity | data | tap | One big number + family stack |
| 2 | Your rhythm | hero | tap | Surprise (when you show up) |
| 3 | **People** | data | tap | Relationship — rank-over-time chart |
| 4 | **Inbox** | hero | tap | Relationship — busiest DM thread |
| 5 | Privacy | trust | tap | Outro |

**Deck simplifications (2026-05):**

- **Six slides** (down from earlier 10-slide prototype).
- Social story = **People** rank chart (merged likes/comments/story taps over 12 months).
- DM story = **Inbox** slide (notification stack + export-scoped % stats + basketball quips).
- Removed from deck: feed personality, streak, busiest day, separate spotlight + podium, old standalone DM slide, profile search, parasocial.

Copy: `buildPeopleQuip()`, `buildDmBalanceSpotlight()`, rhythm/activity quips — export-scoped only.

---

## Card archetypes (Spotify structure → IG implementation)

| Archetype | Spotify feel | IG Wrapped today | Motion (Phase H — done) |
|-----------|--------------|------------------|-------------------------|
| **Hero** | Full-bleed type, one idea | Intro, rhythm, inbox | GSAP stagger / drop / stack |
| **Data** | One dominant stat + chart | Activity, people rank chart | Bar grow, line draw, label travel |
| **Trust** | Calm outro | Privacy (last slide) | Soft segment fade |

---

## IG Wrapped analogue — mechanisms vs slides

| Mechanism | On a slide today? |
|-----------|-------------------|
| Identity | Yes · 0 |
| One big number | Yes · 1, 4 |
| Status (% in export) | Yes · 3–4 |
| Relationship (people) | Yes · 3 |
| Relationship (DM) | Yes · 4 |
| Surprise / rhythm | Yes · 2 |
| Streak | No (removed from deck) |
| Memorable day | No (removed from deck) |
| Global percentile | **Never** |
| Profile search | Parser exists; **not in deck** |

**Optional (Phase J):** `mostUsedWords`, `past_instagram_insights`, self avatar from `profile_photos.json`.

---

## Profile pictures (research note)

- **Export:** Other users’ avatars are **not** in the ZIP; only your `profile_photos.json` is available client-side.
- **Browser:** Instagram CDN images block cross-origin embed (`Cross-Origin-Resource-Policy: same-origin`).
- **Playwright / scraping:** Does **not** require uploading the export ZIP, but a **hosted** scraper typically receives **usernames** (and may store IG session cookies). That changes the privacy story vs “100% local.”
- **Official API:** Basic Display API deprecated Dec 2024; Graph API is Business/Creator + OAuth — not arbitrary @handles from export leaderboards.
- **Pragmatic default:** Initials + colored rings (`WrappedAvatarPodium` still in repo; optional `row.imageUrl`).

---

## Remaining phases (roadmap)

### Phase F — Visual identity **Done**

### Phase G + deck restructure **Done**

### Phase H — Scene choreography **Done**

- GSAP in `wrappedSlideTimeline.js`; sync `WRAPPED_SLIDE_DURATIONS_MS`; hold pauses timeline.

### People + Inbox slides **Done**

- `PeopleRankChart`, `InboxNotificationStack`, `peopleRankHistory.js`, `peopleRankChartLayout.js`.

### Phase I — Music **Done**

- 7-track shuffled playlist on Start Wrapped; mute toggle; spinning cover disc under progress; hold pauses audio; assets in `frontend/public/audio/`.

### Phase J — Extra slides / avatars (optional)

### Phase K — Merge to `main` **← NEXT**

---

## IG export → metric mapping

| Spotify metric | Data today | Parser / field |
|----------------|------------|----------------|
| Minutes listened | Activity count | `heatmapData.totalActivities` (365d trim when needed) |
| Top artist | Top people over time | `peopleRankHistory` / `mostSocialCreators` |
| Top genres | Family mix | `heatmapData.totalsByFamily` |
| Fan leaderboard | Rank chart + quip | `buildPeopleQuip()` |
| Listening streak | Consecutive active days | insights (not on current deck) |
| Memorable day | Busiest day | insights (not on current deck) |
| Top podcasts | Busiest DM thread | `topThreads[0]` + `buildDmBalanceSpotlight()` |
| Search/discovery | — | `profileSearches` unused in player |
| Clubs / personality | — | removed from deck |
| Global top 1% | — | **omit** |

---

## Implementation reference

| File | Role |
|------|------|
| `config/wrappedPlayer.js` | **6** slides, durations |
| `pages/wrappedSlideContent.jsx` | Slide bodies |
| `utils/wrappedSlideTimeline.js` | GSAP timelines per slide |
| `utils/wrappedInsights.js` | People quip, DM inbox spotlight, rhythm |
| `utils/peopleRankHistory.js` | Monthly rank series for People slide |
| `utils/peopleRankChartLayout.js` | Chart coordinates (used by chart + timeline) |
| `utils/socialInteractionGraph.js` | Social aggregation |
| `utils/messageFrequency.js` | Threads + sender split |
| `components/PeopleRankChart.jsx` | Rank-over-time SVG |
| `components/InboxNotificationStack.jsx` | IG-style notification stack |
| `components/RhythmDayFlip.jsx` | Weekday flip on rhythm slide |
| `components/WrappedSlideErrorBoundary.jsx` | Per-slide render fallback |
