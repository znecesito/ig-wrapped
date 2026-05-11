# ig-wrapped

Full-stack app to upload Instagram export JSON files and find accounts you follow that do not follow you back.

## Project structure

- `backend/`: Node.js + Express API
- `frontend/`: React app (Vite)

## Run backend

1. `cd backend`
2. `npm install`
3. `npm run dev`

Backend runs on `http://localhost:4000`.

## Run frontend

1. Open a second terminal and `cd frontend`
2. `npm install`
3. Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if the backend is not on the default `http://localhost:4000/upload`.
4. `npm run dev`

Frontend runs on `http://localhost:5173`.

## Environment variables (frontend)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Full URL for `POST /upload` (Non-Followers tab). Example: `https://your-service.onrender.com/upload`. If unset, the app uses `http://localhost:4000/upload`. |

See `frontend/.env.example`. Do not commit real secrets; for Vercel, set `VITE_API_URL` in the project **Environment Variables** (Production and Preview).

## Deploy (Vercel + Render)

The frontend is a static Vite build. The Non-Followers feature needs the Express backend on a host that runs Node.

### 1. Backend on Render (or similar)

1. Push this repo to GitHub if it is not already there.
2. In [Render](https://render.com), create a **Web Service** from the same repository.
3. Set **Root Directory** to `backend`.
4. **Build Command:** `npm install`
5. **Start Command:** `npm start` (runs `node src/server.js`; the server listens on `process.env.PORT` or `4000` locally).
6. Deploy and note the public URL, e.g. `https://ig-wrapped-api.onrender.com`.

Confirm `POST https://<your-host>/upload` works (e.g. with curl or Postman). Railway, Fly.io, or DigitalOcean App Platform work the same way: Node process + HTTPS URL.

### 2. Frontend on Vercel

1. In [Vercel](https://vercel.com), **Add New Project** and import the repository.
2. Set **Root Directory** to `frontend` (required for this monorepo).
3. Framework preset **Vite** should apply; **Build Command** `npm run build`, **Output Directory** `dist`.
4. Add **Environment Variable** `VITE_API_URL` = `https://<your-render-host>/upload` (match your real API URL, including `/upload`).
5. Deploy. Production and PR **Preview** builds will embed that URL at build time.

`frontend/vercel.json` rewrites unknown paths to `index.html` so deep links and refresh on routes like `/heatmap` work.

### 3. After the API URL changes

Redeploy the frontend whenever `VITE_API_URL` changes so the new value is baked into the build.

## API

- `POST /upload` (`multipart/form-data`)
  - `followersFile` (JSON file)
  - `followingFile` (JSON file)

Response:

```json
{
  "non_followers": ["user1", "user2"]
}
```

## For contributors / AI assistants

- **Rolling context:** [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) — recent features, notable files, and open corners (update after meaningful changes).
- **Stable conventions:** [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc) — stack, folder map, API summary, coding expectations.
- **What runs where:** The **Non-Followers** tab sends files to the backend (`POST /upload`). **Activity Heatmap** and **Social Graph** only use the browser: users pick an Instagram export folder and parsing runs client-side (see `frontend/src/utils/`).
