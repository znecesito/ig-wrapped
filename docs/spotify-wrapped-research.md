# Spotify Wrapped research (for ig-wrapped)

**Sources (May 2026):** [Spotify 2025 Wrapped UX announcement](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/), [2024 Wrapped media kit](https://newsroom.spotify.com/media-kit/2024-wrapped/), [Music Ally 2024 breakdown](https://musically.com/2024/12/04/spotify-wrapped-2024-is-live-top-artists-albums-tracks-and-more/).

**Handoff:** Full phase roadmap and shipped state → [`AGENT_CONTEXT.md`](AGENT_CONTEXT.md).

Visual reference (Spotify marketing): high-contrast collage, oversized year, bold outlines, grain texture, one stat per beat, share cards per datapoint. **Product visual direction for ig-wrapped is IG-native** (gradients, rose/purple, bold type) — borrow Spotify’s **narrative structure and motion**, not their brand palette.

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
| **Share artifact** | Per-stat share cards | Screenshot-friendly 9:16 cards in story player |

**Do not fake** global percentiles (no IG API). Use **self-relative** framing.

---

## Shipped UX (player + lobby)

- **Lobby:** warnings + layman impact → **Start Wrapped**
- **Player:** full-screen, progress segments, tap L/R, hold pause, auto-advance, last slide manual, exit to lobby
- See `WrappedLobby.jsx`, `WrappedStoryPlayer.jsx`, `config/wrappedPlayer.js`

---

## Slide order (current, index 0–9)

0 intro · 1 span · 2 activity · 3 likes · 4 comments · 5 stories · 6 DMs · 7 searches · 8 feed personality · 9 privacy

---

## Remaining phases (roadmap)

### Phase F — Visual identity (IG-native) **Done**

Hero / data / trust templates in `WrappedSlideChrome`, `getCardSurfaceStyle()` in `wrappedThemes.js`, per-slide player backdrop + grain in `tailwind.css`.

### Phase G — Metrics & copy **Done**

- `dmsShare` / `searchesShare`; deduped title vs body on leaderboards.
- Slide **8** = feed personality, **9** = privacy (privacy is last / manual advance).

### Phase H — Scene choreography **← NEXT**

- GSAP (preferred) or Framer Motion timelines per slide; sync with `WRAPPED_SLIDE_DURATIONS_MS`.
- Hold pauses timeline + segment progress.
- Spotify-style **beats** (stagger reveals), not trivial fades.

### Phase I — Music

- Royalty-free loops mapped to `FEED_PERSONALITIES`; Start unlocks audio; mute control; pause with hold.

### Phase J — Extra slides (optional)

- `mostUsedWords`, `past_instagram_insights`, busiest-day card, month phases.

### Phase K — Merge

- `feat/tailwind-foundation` → `main`; iPhone QA; remove `WrappedStoryDeck.jsx`.

---

## IG export → metric mapping

| Spotify metric | Data today | Parser / field |
|----------------|------------|----------------|
| Minutes listened | Activity count (proxy) | `heatmapData.totalActivities` |
| Top artist | Top liked creator | `mostLikedCreators[0]` |
| Top genres | Family mix | `heatmapData.totalsByFamily` |
| Musical phases | Dominant family + time | `buildWrappedInsights()` |
| Fan leaderboard | #1 + gap vs #2 | `topPersonShareLines()` |
| Listening streak | Consecutive active days | `calendarDays` |
| Memorable day | Busiest day | `calendarDays` |
| Top podcasts | Top DM threads | `topThreads` |
| Search/discovery | Profile searches | `profileSearches` |
| Clubs / personality | Feed personality | `FEED_PERSONALITIES` |
| Global top 1% | — | **omit** |

---

## Implementation reference

| File | Role |
|------|------|
| `config/wrappedPlayer.js` | Slide count, `WRAPPED_SLIDE_DURATIONS_MS` |
| `components/WrappedLobby.jsx` | Pre-player gate |
| `components/WrappedStoryPlayer.jsx` | Immersive player |
| `context/WrappedPlayerContext.jsx` | Hide nav in player |
| `utils/wrappedInsights.js` | Metrics + share lines + personality |
| `utils/parseWarningImpact.js` | Lobby warning copy |
| `pages/wrappedSlideContent.jsx` | Slide bodies |
| `components/WrappedSlideChrome.jsx` | Card shell (extend for Phase F templates) |
| `components/wrappedSlideClasses.js` | Tailwind class strings |
| `tailwind.css` | Tokens, player layout, card animations |
