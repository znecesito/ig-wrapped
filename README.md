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
3. `npm run dev`

Frontend runs on `http://localhost:5173`.

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
