# Spotify Wrapped research (for ig-wrapped)

**Sources (May 2026):** [Spotify 2025 Wrapped UX announcement](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/), [2024 Wrapped media kit](https://newsroom.spotify.com/media-kit/2024-wrapped/), [Music Ally 2024 breakdown](https://musically.com/2024/12/04/spotify-wrapped-2024-is-live-top-artists-albums-tracks-and-more/).

**Handoff:** Full phase roadmap and shipped state → [`AGENT_CONTEXT.md`](AGENT_CONTEXT.md). **Phase H = next session** (fresh context recommended).

Visual reference (Spotify marketing): high-contrast collage, oversized year, bold outlines, grain texture, one stat per beat, share cards per datapoint. **Product visual direction for ig-wrapped is IG-native** (gradients, rose/purple, bold type) — borrow Spotify’s **narrative structure and motion**, not their brand palette.

---

## Why people share Wrapped

| Mechanism | Spotify example | IG Wrapped analogue |
|-----------|-----------------|---------------------|
| **Identity** | “This is *my* year” | Handle + export year + personality |
| **One big number** | Minutes listened | Total activities, top person’s share % |
| **Status** | Top 1% of listeners for artist X | “#1 in *your* export” + gap vs #2 (honest, not global percentile) |
| **Relationship** | Top artist / song | Top person (merged social) + busiest DM thread |
| **Surprise** | Musical phases, Clubs | Rhythm persona, streak, busiest day, dominant family |
| **Streak / dedication** | Longest listening streak | Longest consecutive active days |
| **Share artifact** | Per-stat share cards | Screenshot-friendly 9:16 cards in story player |

**Do not fake** global percentiles (no IG API). Use **self-relative** framing.

---

## Shipped UX (player + lobby)

- **Lobby:** warnings + layman impact → **Start Wrapped**
- **Player:** full-screen, progress segments, tap L/R, hold pause, auto-advance, last slide manual, exit to lobby
- See `WrappedLobby.jsx`, `WrappedStoryPlayer.jsx`, `config/wrappedPlayer.js` — **`WRAPPED_CARD_COUNT = 10`**

---

## Slide order (current, index 0–9)

| # | Beat | Template | Archetype |
|---|------|----------|-----------|
| 0 | Intro | hero | Identity |
| 1 | Feed personality | hero | Clubs / persona |
| 2 | Activity mix | data | One big number + stack |
| 3 | Your rhythm | hero | Surprise (when you show up) |
| 4 | Longest streak | hero | Dedication |
| 5 | Busiest day | hero | Memorable day |
| 6 | **#1 person** | hero | Relationship (merged social) |
| 7 | Top accounts | data | Ranking (podium + stack) |
| 8 | **You vs them** | hero | Relationship (busiest DM thread) |
| 9 | Privacy | trust | Outro |

**Deck simplifications (2026-05):**

- **One** social spotlight + **one** ranking (likes + comments + story taps merged).
- **One** DM slide: you vs them on **busiest thread** only (no thread ranking, no inbox-wide personality).
- Profile search, parasocial, and per-category spotlight pairs **removed**.

Spotlight copy: `buildSocialSpotlight()`, `buildDmBalanceSpotlight()` — export-scoped only.

---

## Card archetypes (Spotify structure → IG implementation)

| Archetype | Spotify feel | IG Wrapped today | Phase H (motion) |
|-----------|--------------|------------------|------------------|
| **Hero** | Full-bleed type, one idea | Intro, personality, rhythm, streak, day, spotlights, DM | Stagger `data-wrapped-beat` |
| **Data** | One dominant stat + chart | Activity mix, social ranking | Reveal stack segments |
| **Trust** | Calm outro | Privacy (last slide) | Soft fade |

---

## IG Wrapped analogue — mechanisms vs slides

| Mechanism | On a slide today? |
|-----------|-------------------|
| Identity | Yes · 0, 1 |
| One big number | Yes · 2 |
| Status (% in export) | Yes · 6 |
| Relationship (people) | Yes · 6–7 |
| Relationship (DM) | Yes · 8 (busiest thread) |
| Surprise / rhythm | Yes · 3 |
| Streak | Yes · 4 |
| Memorable day | Yes · 5 |
| Global percentile | **Never** |
| Profile search | Parser exists; **not in deck** |

**Optional (Phase J):** `mostUsedWords`, `past_instagram_insights`, self avatar from `profile_photos.json`.

---

## Profile pictures (research note)

- **Export:** Other users’ avatars are **not** in the ZIP; only your `profile_photos.json` is available client-side.
- **Browser:** Instagram CDN images block cross-origin embed (`Cross-Origin-Resource-Policy: same-origin`).
- **Playwright / scraping:** Does **not** require uploading the export ZIP, but a **hosted** scraper typically receives **usernames** (and may store IG session cookies). That changes the privacy story vs “100% local.”
- **Official API:** Basic Display API deprecated Dec 2024; Graph API is Business/Creator + OAuth — not arbitrary @handles from export leaderboards.
- **Pragmatic default:** Initials + colored rings (`WrappedAvatarPodium` already supports optional `row.imageUrl` with fallback).

---

## Remaining phases (roadmap)

### Phase F — Visual identity **Done**

### Phase G + deck restructure **Done**

### Phase H — Scene choreography **← NEXT**

- GSAP timelines per slide; sync `WRAPPED_SLIDE_DURATIONS_MS`; hold pauses timeline.

### Phase I — Music

### Phase J — Extra slides / avatars (optional)

### Phase K — Merge to `main`

---

## IG export → metric mapping

| Spotify metric | Data today | Parser / field |
|----------------|------------|----------------|
| Minutes listened | Activity count | `heatmapData.totalActivities` (365d trim when needed) |
| Top artist | Top person (merged) | `mostSocialCreators[0]` |
| Top genres | Family mix | `heatmapData.totalsByFamily` |
| Fan leaderboard | #1 + gap vs #2 | `buildSocialSpotlight()` |
| Listening streak | Consecutive active days | `calendarDays` in insights |
| Memorable day | Busiest day | `busiestCalendarDay()` |
| Top podcasts | Busiest DM thread | `topThreads[0]` + sender split |
| Search/discovery | — | `profileSearches` unused in player |
| Clubs / personality | Feed personality | `FEED_PERSONALITIES` |
| Global top 1% | — | **omit** |

---

## Implementation reference

| File | Role |
|------|------|
| `config/wrappedPlayer.js` | **10** slides, durations |
| `pages/wrappedSlideContent.jsx` | Slide bodies |
| `utils/wrappedInsights.js` | Social + DM spotlights, rhythm, streak |
| `utils/socialInteractionGraph.js` | `buildTopSocialCreatorsWithBreakdown` |
| `utils/messageFrequency.js` | Threads + `selfMessageCount` / `otherMessageCount` |
| `components/WrappedSpotlightHero.jsx` | Spotlight avatar + @handle |
| `components/WrappedAvatarPodium.jsx` | Ranking avatars (`imageUrl` optional) |
