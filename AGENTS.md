# AGENTS.md

Guidance for AI assistants working in this repository. Product and stack details live in [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc) and [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md).

## Cursor Cloud specific instructions

### What runs locally

| Service | Directory | Command | URL |
| --- | --- | --- | --- |
| **Frontend (required)** | `frontend/` | `npm run dev` | `http://localhost:5173` → `/wrapped` |
| **Backend (optional)** | `backend/` | `npm run dev` | `http://localhost:4000` — `GET /health` → `{ "ok": true }` |

The shipped Wrapped UI is **client-only**: no `VITE_API_URL` or backend is needed for `/wrapped` or `/guide`.

### Lint / test / build

- **Lint:** none configured (no ESLint in `package.json`).
- **Tests:** none configured (no unit or E2E runner in repo).
- **CI parity:** from `frontend/`, run `npm ci && npm run build` (see `.github/workflows/frontend-ci.yml`).
- **Preview production build:** `npm run preview` in `frontend/` (default port **4173**).

### Dev servers

Use **tmux** for long-running `npm run dev` processes so sessions survive disconnects. Example:

```bash
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s vite-dev -c /workspace/frontend -- bash -lc 'npm run dev -- --host 127.0.0.1'
```

### Manual E2E (Wrapped)

1. Start the frontend dev server.
2. Open `/wrapped`, use **Choose ZIP** or **Choose folder**.
3. Export must include paths with `your_instagram_activity/` or `personal_information/` (see `frontend/src/utils/exportIngest.js`).

For a **minimal local fixture** without a real Instagram export, create a ZIP with:

- `personal_information/personal_information/personal_information.json` — `profile_user[].string_map_data.Username.value`
- `your_instagram_activity/likes/liked_posts.json` — `likes_media_likes[]` items with `timestamp` and `title` (username)

Example paths used in Cloud setup validation: zip at `test-fixtures/minimal-instagram-export.zip` (create on demand if missing).

### Gotchas

- **Node:** CI uses Node 20; Node 22 works for install/build/dev in practice.
- **No root `package.json`:** install and run commands separately under `frontend/` and `backend/`.
- **Backend** is only for legacy `POST /upload` (non-followers); the current nav does not call it.
