# ig-wrapped

**Instagram Wrapped** in your browser: load your official export (ZIP or folder), tap **Start Wrapped**, and play through **six** portrait story cards—activity, rhythm, top people, inbox, and privacy. Your export stays on your device; nothing is uploaded for Wrapped.

## What you can do today

| Route | What it does |
| --- | --- |
| `/wrapped` | **Wrapped** — load export → lobby → full-screen story player (6 cards) |
| `/guide` | **How to export** — phone vs desktop steps for your Instagram JSON export |

Visiting `/` or old paths like `/heatmap` redirects to **`/wrapped`**.

### Coming soon: landing page (Phase L–P)

Work on branch **`feat/landing-page`** will add:

| Route | What it will do |
| --- | --- |
| `/` | **Landing** — hero, product preview, how-to section, FAQ, CTAs |
| `/wrapped` | **Wrapped** — focused load surface (guide moves to landing) |
| `/guide` | Redirects to `/#how-to` on the landing page |

See [Development roadmap](#development-roadmap) and [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) for phase details.

## How Wrapped works

1. **Load export** — Choose ZIP or folder (see [Load your export](#load-your-export)).
2. **Lobby** — Short intro; if parsing hit snags, read what each warning affects and acknowledge before continuing.
3. **Start Wrapped** — Full-screen story player (like Stories):
   - Progress segments across the top (fill tracks slide animations; you tap when ready for the next beat)
   - **Tap** right for next, left for previous (no auto-advance)
   - **Hold** to pause story + soundtrack; release to resume
   - **Soundtrack:** shuffled playlist starts on Start Wrapped; **spinning disc + mute + ×** under the progress bar (top-right)
   - **Exit:** ×, swipe down, or Escape → back to lobby
4. **Share** — **Screenshot** the card you want for Instagram Stories (no in-app download button).

On desktop, the background fills the browser; the card stays a centered phone-sized 9:16 frame so screenshots still look right.

## The six slides

| # | Slide | What you see |
| --- | --- | --- |
| 0 | Intro | Your year + @handle + activity summary |
| 1 | Activity | Family mix stack, total count, quip |
| 2 | Rhythm | Peak weekday flip, persona title, quip |
| 3 | People | Rank-over-time chart for top accounts + quip |
| 4 | Inbox | Notification stack → busiest thread stats + quip |
| 5 | Privacy | Local-only reminder (tap to finish) |

## Load your export

1. In Instagram: **Accounts Center** → **Your information and permissions** → **Export your information** → **Export to device**, format **JSON**.
2. For the best balance of detail and file size, set the date range to about **6 months to 1 year**.
3. When the export is ready, open ig-wrapped and either:
   - **Choose ZIP** — pick the `.zip` from Instagram (recommended on phone), or
   - **Choose folder** — pick the unzipped folder that contains `your_instagram_activity`.

Parsing runs entirely in your browser. **Returning visitors** typically need a **new export** from Meta for activity since their last visit; download links expire after a few days.

## Project structure

- `frontend/` — React + Vite app (shipped product)
- `backend/` — optional Express API (`GET /health`, legacy `POST /upload`; not used by Wrapped UI)
- `docs/AGENT_CONTEXT.md` — handoff for contributors / AI (phases, files, what’s next)
- `docs/spotify-wrapped-research.md` — Wrapped-style metrics and roadmap

### Frontend styling

| Path | Role |
| --- | --- |
| `frontend/src/tailwind.css` | Tailwind entry + `@theme` tokens + story player layout |
| `frontend/src/lib/tokens.js` | Slide accents and brand colors (JS) |
| `frontend/src/lib/utils.js` | `cn()` — merge Tailwind classes |
| `frontend/src/components/wrappedSlideClasses.js` | Shared Tailwind strings for slides |
| `frontend/src/styles.css` | Legacy nav, export guide, picker |

**Local dev:** If `/wrapped` is blank after pulling, clear Vite cache: `rm -rf frontend/node_modules/.vite`, then `npm run dev` again.

## Development roadmap

**Wrapped SLC** is on **`main`**. **Landing page** work is planned on **`feat/landing-page`**.

| Phase | Status | Summary |
| --- | --- | --- |
| Tailwind + slides A–D | Done | Design system, card shell, slide content |
| E Story player | Done | Lobby, Start Wrapped, full-screen tap-to-advance + hold pause |
| F Visual (IG-native) | Done | Hero/data/trust templates, player backdrop |
| G Deck + copy | Done | Activity, rhythm, insights copy |
| H Motion | Done | GSAP scene beats per slide (stack, chart draw, inbox stack) |
| People + Inbox slides | Done | Rank chart + notification stack replace older social/DM beats |
| I Music | Done | 7-track shuffle, mute, spinning cover disc in player chrome |
| K Ship | Done | Merged to `main` |
| **0 Landing docs** | Done | IA, phases L–R, metrics taxonomy |
| **L Foundation** | Next | Routing, landing shells, slim `/wrapped` empty state |
| **M–P Landing UI** | Planned | Hero, preview, how-to section, FAQ, polish |
| **Q Analytics** | Optional | Funnel events (no PII) after landing ships |
| **R Ship landing** | Planned | Merge `feat/landing-page` → `main` |

See [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) for locked landing decisions, section map, and success metrics.

## Run locally

### Frontend (required)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — you’ll land on Wrapped (landing at `/` comes in Phase L).

### Backend (optional)

Only needed for the legacy upload API:

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:4000`.

## Environment variables (frontend)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Optional. Full URL for legacy `POST /upload`. Unused by Wrapped-only UI. |

See `frontend/.env.example`.

## Deploy (Vercel + optional Render)

### Frontend on Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. **Root Directory:** `frontend`
3. **Build:** `npm run build` · **Output:** `dist`
4. **Production** from **`main`**. Other branches and PRs get **Preview** URLs.

`frontend/vercel.json` rewrites routes to `index.html` so `/wrapped` and `/guide` work on refresh.

**Test before merge:** push your branch → open the Vercel preview → test lobby → Start Wrapped → full playthrough on a phone.

### Backend on Render (optional)

Root **`backend`**, start **`npm start`**, health at `GET /health`.

## CI

`.github/workflows/frontend-ci.yml` runs `npm ci && npm run build` on PRs touching `frontend/**`.

## API (legacy backend)

- `GET /health` → `{ "ok": true }`
- `POST /upload` — `followersFile` + `followingFile` → `{ "non_followers": [...] }`

## For contributors / AI assistants

- **Start here:** [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) (landing Phase L next, metrics taxonomy)
- **Metrics / Spotify mapping:** [`docs/spotify-wrapped-research.md`](docs/spotify-wrapped-research.md)
- **Conventions:** [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc)

Legacy analysis pages (`HeatmapPage`, `SocialGraphPage`, etc.) remain for parsers but are not routed in the app.
