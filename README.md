# ig-wrapped

**Instagram Wrapped** in your browser: load your official export (ZIP or folder), get ten portrait story cards—activity, top people, DMs, searches, and more. Your export stays on your device; nothing is uploaded for Wrapped.

## What you can do today

| Route | What it does |
| --- | --- |
| `/wrapped` | **Wrapped** — load export → scroll or step through 10 story-style cards (9:16, shareable screenshots) |
| `/guide` | **How to export** — phone vs desktop steps for getting your Instagram JSON export |

Visiting `/` or old paths like `/heatmap` redirects to **`/wrapped`**.

## Load your export

1. In Instagram: **Accounts Centre** → **Your information and permissions** → **Export your information** → **Export to device**, format **JSON**.
2. For the best balance of detail and file size, set the date range to about **6 months to 1 year**.
3. When the export is ready, open ig-wrapped and either:
   - **Choose ZIP** — pick the `.zip` from Instagram (recommended on phone), or
   - **Choose folder** — pick the unzipped folder that contains `your_instagram_activity`.

Parsing runs entirely in your browser.

## Project structure

- `frontend/` — React + Vite app (shipped product)
- `backend/` — optional Express API (`GET /health`, legacy `POST /upload` for non-followers; not used by the current UI)

## Run locally

### Frontend (required)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — you’ll land on Wrapped.

### Backend (optional)

Only needed if you work on the legacy upload API:

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:4000`.

## Environment variables (frontend)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Optional. Full URL for legacy `POST /upload` (e.g. `https://your-api.onrender.com/upload`). Unused by the Wrapped-only UI. |

See `frontend/.env.example`. For Vercel, set variables in the project dashboard (Production + Preview) if you use the backend again.

## Deploy (Vercel + optional Render)

### Frontend on Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. **Root Directory:** `frontend`
3. **Build:** `npm run build` · **Output:** `dist`
4. Deploy — pushes to your connected branch update production (and PRs get preview URLs).

`frontend/vercel.json` rewrites routes to `index.html` so `/wrapped` and `/guide` work on refresh.

### Backend on Render (optional)

1. Create a **Web Service** from the same repo.
2. **Root Directory:** `backend`
3. **Build:** `npm install` · **Start:** `npm start`
4. Confirm `GET https://<host>/health` returns `{ "ok": true }`.

Redeploy the frontend with `VITE_API_URL` only if you re-enable server-side uploads.

## CI

GitHub Actions (`.github/workflows/frontend-ci.yml`) runs `npm ci && npm run build` on pull requests that touch `frontend/**`.

## API (legacy backend)

- `GET /health` → `{ "ok": true }`
- `POST /upload` — `followersFile` + `followingFile` (JSON) → `{ "non_followers": ["user1", ...] }`

## For contributors / AI assistants

- **Rolling context:** [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md)
- **Conventions:** [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc)

Legacy analysis pages (`HeatmapPage`, `SocialGraphPage`, etc.) and parsers under `frontend/src/utils/` remain for Wrapped’s data pipeline but are not linked in the nav.
