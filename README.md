# ig-wrapped

**Instagram Wrapped** in your browser: load your official export (ZIP or folder), tap **Start Wrapped**, and play through **six** portrait story cards—activity, rhythm, top people, inbox, and privacy. Your export stays on your device; nothing is uploaded for Wrapped.

## What you can do today

### Production (`main`)

| Route | What it does |
| --- | --- |
| `/wrapped` | **Wrapped** — load export → lobby → full-screen story player (6 cards) |
| `/guide` | **How to export** (legacy standalone page) |

Visiting `/` redirects to **`/wrapped`**.

### Preview (`feat/landing-page` branch)

| Route | What it does |
| --- | --- |
| `/` | **Landing** — hero, what you get, how it works, how-to export, FAQ (coming) |
| `/wrapped` | **Wrapped** — returning-user note + load export → lobby → player |
| `/guide` | Redirects to `/#how-to` on the landing page |

Use the Vercel **preview URL** for this branch to test the landing before merge to `main`.

## How Wrapped works

1. **Load export** — Choose ZIP or folder on `/wrapped`.
2. **Lobby** — Short intro; acknowledge parse warnings if any.
3. **Start Wrapped** — Full-screen story player (tap to advance, hold to pause, soundtrack + mute).
4. **Share** — Screenshot any card for Instagram Stories.

## The six slides

| # | Slide | What you see |
| --- | --- | --- |
| 0 | Intro | Your year + @handle + activity summary |
| 1 | Activity | Family mix stack, total count, quip |
| 2 | Rhythm | Peak weekday flip, persona title, quip |
| 3 | People | Rank-over-time chart for top accounts + quip |
| 4 | Inbox | Notification stack → busiest thread stats + quip |
| 5 | Privacy | Local-only reminder (tap to finish) |

## Export guide (landing preview branch)

On **`feat/landing-page`**, export instructions live at **`/#how-to`** on the landing page:

- Phone-only, **two annotated screenshots** (setup + download)
- Badge labels on setup image: **a** export to device, **b** email, **c** date range, **d** JSON
- **Returning?** notice on **`/wrapped`** — request a fresh export for new activity

Assets: `frontend/public/export-guide/phone/`. Playbook: [`docs/export-guide-images.md`](docs/export-guide-images.md).

## Project structure

- `frontend/` — React + Vite app
- `backend/` — optional Express API (not used by Wrapped UI)
- `docs/AGENT_CONTEXT.md` — **start here** for contributors / AI
- `docs/export-guide-images.md` — screenshot spec + Photopea workflow

## Development roadmap

| Phase | Status | Summary |
| --- | --- | --- |
| Wrapped SLC (A–I, K) | Done on `main` | 6-slide player, GSAP, soundtrack |
| Landing L–O | Done on `feat/landing-page` | Hero, preview, steps, export guide |
| Export PNGs | Done | 2 redacted phone screenshots |
| **P FAQ + polish** | **Next** | FAQ, final CTA, merge candidate |
| Q Analytics | Optional | Funnel events |
| R Ship | Planned | Merge landing → `main` |

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — on **`feat/landing-page`**, `/` is the landing page.

## Deploy

- **Vercel** — root `frontend`, production from **`main`**, previews for other branches.
- Test landing on preview: `/`, `/#how-to`, `/wrapped`, then full Wrapped playthrough on a phone.

## For contributors / AI assistants

- **Handoff:** [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) — Phase **P** next on `feat/landing-page`
- **Conventions:** [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc)
<!-- git connectivity test: 2026-08-29 -->
