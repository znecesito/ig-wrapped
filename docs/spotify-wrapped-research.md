# Spotify Wrapped research (for ig-wrapped)

**Sources (May 2026):** [Spotify 2025 Wrapped UX announcement](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/), [2024 Wrapped media kit](https://newsroom.spotify.com/media-kit/2024-wrapped/), [Music Ally 2024 breakdown](https://musically.com/2024/12/04/spotify-wrapped-2024-is-live-top-artists-albums-tracks-and-more/).

Visual reference: high-contrast collage, oversized year, bold outlines, grain texture, one stat per beat, share cards per datapoint.

---

## Why people share Wrapped

| Mechanism | Spotify example | IG Wrapped analogue |
|-----------|-----------------|---------------------|
| **Identity** | “This is *my* year” | Handle + export span + personality label |
| **One big number** | Minutes listened | Total activities, top person’s share % |
| **Status** | Top 1% of listeners for artist X | “#1 in *your* export” + gap vs #2 (honest, not global percentile) |
| **Relationship** | Top artist / song | Top liked / commented / DM thread |
| **Surprise** | Musical phases, Clubs | Dominant activity family, night-owl hour, busiest day |
| **Streak / dedication** | Longest listening streak | Longest consecutive active days in export |
| **Share artifact** | Per-stat share cards | Screenshot-friendly 9:16 cards (existing) |

**Do not fake** global percentiles (no IG API). Use **self-relative** framing: “62% of your activity was likes”, “You liked @x 3× more than anyone else in this export”.

---

## Spotify slide inventory (listener)

### Classics (every year)

- Minutes listened (total time)
- Top 5 songs + playlist
- Top 5 artists
- Top genres
- Artist thank-you clip (optional)

### 2024 additions

- Up to **3 musical phases** + evolution playlist
- **Listening streak** for top artist
- **Fan percentile** (top 1% / 5% for an artist)
- AI podcast / DJ commentary (English, limited markets)

### 2025 additions

- Top albums, audiobook genre, podcaster/author clips
- **Top Artist Sprint** (rank shifts month-by-month)
- **Fan Leaderboard** (worldwide rank among artist’s listeners)
- **Clubs** (6 listening-style personas)
- **Listening Archive** (memorable days, AI snapshots)
- **Wrapped Party** (social at end)

---

## IG export → metric mapping

| Spotify metric | Data in ig-wrapped today | Parser / field |
|----------------|--------------------------|----------------|
| Minutes listened | Activity event count (proxy) | `heatmapData.totalActivities` |
| Top artist | Top liked creator | `mostLikedCreators[0]` |
| Top genres | Activity family mix | `heatmapData.totalsByFamily` |
| Musical phases | Dominant family + weekday/hour | `buildWrappedInsights()` |
| Fan leaderboard | #1 + gap vs #2 per category | social leaderboards |
| Listening streak | Max consecutive active days | `heatmapData.calendarDays` |
| Memorable day | Busiest calendar day | `calendarDays[].count` |
| Top podcasts | Top DM threads | `topThreads` |
| Search/discovery | Profile searches | `profileSearches` |
| Clubs / personality | Feed personality label | derived from dominant family |
| Creator clip | — | not in export |
| Global top 1% | — | **omit** (misleading) |

### Future export files

- `past_instagram_insights` — creator metrics (teaser slide today)
- `mostUsedWords.js` — DM/comment word personality
- Non-followers — different product tone

---

## Recommended ig-wrapped narrative (10 cards)

Keep scroll model; reorder copy to Spotify rhythm:

1. **Hook** — handle + “Your feed, wrapped” + export year
2. **Span** — date range (label as “this export”, not calendar year)
3. **Big number** — total activities + **dominant family %** (new hero)
4. **Top liked** — podium + **share line** (% of likes or gap vs #2)
5. **Top commented** — same pattern
6. **Story interactions** — same
7. **DMs** — top thread + message count
8. **Searches** — top profile (curiosity / vulnerability → share)
9. **Feed personality** — Club-style label + 2–3 supporting stats (replaces generic teaser)
10. **Privacy** — trust (unchanged)

---

## Visual direction (hybrid sprint)

- One **hero stat** per data slide (already partially there)
- **Personality slide**: full-bleed accent, display type, 2–3 bullets max
- **Punchline strip** under mega stat (`SLIDE_INSIGHT_PUNCH`)
- Motion: stagger existing reveal; optional count-up later
- Avoid: global percentile claims, parallax, heavy WebGL

---

## Implementation in repo

- `frontend/src/config/wrappedPlayer.js` — slide count + auto-advance durations
- `frontend/src/components/WrappedLobby.jsx` — Start Wrapped + warnings
- `frontend/src/components/WrappedStoryPlayer.jsx` — full-screen player
- `frontend/src/utils/wrappedInsights.js` — `buildWrappedInsights(baseline)`
- `frontend/src/utils/parseWarningImpact.js` — layman warning → affected slides
- `wrappedSlideContent.jsx` — slide content + Spotify-style copy

Update this doc when export parsers or slide order change.
