# ig-wrapped

**Instagram Wrapped** in your browser: load your official export (ZIP or folder), get ten portrait story cards—activity, top people, DMs, searches, and more. Your export stays on your device; nothing is uploaded for Wrapped.

## What you can do today

| Route | What it does |
| --- | --- |
| `/wrapped` | **Wrapped** — load export → scroll or step through 10 story-style cards (9:16) |
| `/guide` | **How to export** — phone vs desktop steps for getting your Instagram JSON export |

Visiting `/` or old paths like `/heatmap` redirects to **`/wrapped`**.

## Share to Stories

Wrapped does **not** include a Save or download button. For sharing, **screenshot the card** you want while viewing it in the app (same as posting any other story image from your camera roll). That keeps the image exactly what you see on screen.

## Load your export

1. In Instagram: **Accounts Center** → **Your information and permissions** → **Export your information** → **Export to device**, format **JSON**.
2. For the best balance of detail and file size, set the date range to about **6 months to 1 year**.
3. When the export is ready, open ig-wrapped and either:
   - **Choose ZIP** — pick the `.zip` from Instagram (recommended on phone), or
   - **Choose folder** — pick the unzipped folder that contains `your_instagram_activity`.

Parsing runs entirely in your browser.

## Project structure

- `frontend/` — React + Vite app (shipped product)
- `backend/` — optional Express API (`GET /health`, legacy `POST /upload` for non-followers; not used by the current UI)

### Frontend styling (Tailwind migration)

The UI is migrating incrementally to **Tailwind CSS v4**:

| Path | Role |
| --- | --- |
| `frontend/src/tailwind.css` | Tailwind entry + `@theme` design tokens |
| `frontend/src/lib/tokens.js` | Same tokens in JS (charts, inline styles) |
| `frontend/src/lib/utils.js` | `cn()` — merge Tailwind class names |
| `frontend/src/styles.css` | Legacy styles (still drives most visuals) |
| `frontend/vite.config.js` | Vite + `@tailwindcss/vite` |

New UI should use Tailwind utilities and tokens (`bg-brand`, `text-ink`, `rounded-card`, etc.). Existing screens may look unchanged until each area is migrated on purpose.

**Local dev:** If `/wrapped` is a blank page after pulling, clear a stale Vite cache: `rm -rf frontend/node_modules/.vite`, then `npm run dev` again (can happen after removed dependencies such as `html-to-image`).

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
4. **Production** deploys from **`main`**. Other branches and pull requests get **Preview** URLs automatically (same project, root `frontend`).

`frontend/vercel.json` rewrites routes to `index.html` so `/wrapped` and `/guide` work on refresh.

**Try a feature branch before merge:** push your branch → open the branch or PR deployment in Vercel → test `/wrapped` and `/guide` on the preview URL → merge to `main` when ready.

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
