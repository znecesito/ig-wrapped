# ig-wrapped

**Instagram Wrapped** in your browser: load your official export (ZIP or folder), tap **Start Wrapped**, and play through **ten** portrait story cards—activity, rhythm, top people, DMs, and your feed personality. Your export stays on your device; nothing is uploaded for Wrapped.

## What you can do today

| Route | What it does |
| --- | --- |
| `/wrapped` | **Wrapped** — load export → lobby → full-screen story player (10 cards) |
| `/guide` | **How to export** — phone vs desktop steps for your Instagram JSON export |

Visiting `/` or old paths like `/heatmap` redirects to **`/wrapped`**.

## How Wrapped works

1. **Load export** — Choose ZIP or folder (see [Load your export](#load-your-export)).
2. **Lobby** — Short intro; if parsing hit snags, read what each warning affects and acknowledge before continuing.
3. **Start Wrapped** — Full-screen story player (like Stories / Spotify Wrapped):
   - Progress bar across the top
   - **Tap** right side for next, left for previous
   - **Hold** to pause; release to resume
   - Slides auto-advance unless you hold (last slide waits for you)
   - **Exit:** × button, swipe down, or Escape → back to lobby
4. **Share** — **Screenshot** the card you want for Instagram Stories (no in-app download button).

On desktop, the background fills the browser; the card stays a centered phone-sized 9:16 frame so screenshots still look right.

## Load your export

1. In Instagram: **Accounts Center** → **Your information and permissions** → **Export your information** → **Export to device**, format **JSON**.
2. For the best balance of detail and file size, set the date range to about **6 months to 1 year**.
3. When the export is ready, open ig-wrapped and either:
   - **Choose ZIP** — pick the `.zip` from Instagram (recommended on phone), or
   - **Choose folder** — pick the unzipped folder that contains `your_instagram_activity`.

Parsing runs entirely in your browser.

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

Work is on branch **`feat/tailwind-foundation`** (preview on Vercel before merge to `main`).

| Phase | Status | Summary |
| --- | --- | --- |
| Tailwind + slides A–D | Done | Design system, card shell, all slide content |
| E Story player | Done | Lobby, Start Wrapped, full-screen tap/hold/auto-advance |
| F Visual (IG-native) | Done | Hero/data/trust templates, player backdrop |
| G Deck + copy | Done | Merged social, DM you vs them, rhythm/streak/day beats |
| **H Motion** | **Next** | GSAP-style scene beats per slide |
| I Music | Planned | Optional ambient loops by personality |
| K Ship | Planned | Merge to `main` after iPhone QA |

See [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) for the **10-slide** deck, locked UX, and Phase H handoff.

## Run locally

### Frontend (required)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — you’ll land on Wrapped.

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

- **Start here:** [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) (branch, 10-slide deck, next = **Phase H**)
- **Metrics / Spotify mapping:** [`docs/spotify-wrapped-research.md`](docs/spotify-wrapped-research.md)
- **Conventions:** [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc)

Legacy analysis pages (`HeatmapPage`, `SocialGraphPage`, etc.) remain for parsers but are not routed in the app.
