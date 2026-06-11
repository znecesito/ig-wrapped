# Agent context (rolling)

**Last updated:** 2026-06-09 — **Landing page L–O + export screenshots** on **`feat/landing-page`** (preview URL). **`main`** still has Wrapped-only UI (no landing). **Next: Phase P** (FAQ + final CTA).

Short "where we left off" for contributors and AI assistants. For invariant stack and tree, see [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc). Export screenshots: [`export-guide-images.md`](export-guide-images.md). Spotify metrics: [`spotify-wrapped-research.md`](spotify-wrapped-research.md).

---

## Branch and deploy

- **Production (`main`):** Wrapped player + lobby + 6 slides — routes `/` → `/wrapped`, legacy **Wrapped | How to export** nav.
- **Active work:** **`feat/landing-page`** — landing at `/`, phases **L–O done**, export PNGs redacted/annotated (**a–d** badges on image 1).
- **Vercel:** `main` → production; **`feat/landing-page`** → preview URL per push. Test landing on preview before merge.
- **Merge gate (Phase R):** iPhone Safari full flow; Wrapped regression; FAQ done (Phase P).

---

## Product focus — `feat/landing-page` (preview)

### Routes

| Route | Role |
|-------|------|
| **`/`** | **Landing** — hero, what you get, how it works, `#how-to`, FAQ + final CTA placeholders |
| **`/wrapped`** | **Product** — returning notice + export picker → lobby → player |
| **`/guide`** | Redirect to `/#how-to` |

[`resolveRoute`](../frontend/src/config/features.js) + [`App.jsx`](../frontend/src/App.jsx). Hash scroll: [`scrollToLandingSection`](../frontend/src/config/features.js) (offsets sticky nav).

### Landing sections (status)

| Section | ID | Status |
|---------|-----|--------|
| Hero + trust + CTAs | `hero` | **Done** — [`LandingHero.jsx`](../frontend/src/components/landing/LandingHero.jsx) |
| What you get (6 teasers) | `preview` | **Done** — [`LandingPreview.jsx`](../frontend/src/components/landing/LandingPreview.jsx) |
| How it works (3 steps) | `steps` | **Done** — [`LandingHowItWorks.jsx`](../frontend/src/components/landing/LandingHowItWorks.jsx) |
| How to export | `how-to` | **Done** — [`LandingHowTo.jsx`](../frontend/src/components/landing/LandingHowTo.jsx) + [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) |
| FAQ | `faq` | **Placeholder** — Phase P |
| Final CTA | `cta` | **Placeholder** — Phase P |

### Nav (landing)

- **ig-wrapped** → `/` (text link, not a button — avoids global `button` styles)
- **What you get** → `#preview` · **How to export** → `#how-to` · **Get started** → `/wrapped`
- Off landing: **Home** · **Wrapped** · **How to export**
- **Data loaded / Clear** when export ingested; nav hidden in story player only

### Locked landing decisions

- **No export picker on landing** — only on `/wrapped`.
- **Hero CTAs:** Primary → `/wrapped`; secondary → `#how-to`.
- **Returning users:** **“Returning?”** notice on **`/wrapped`** only (fresh export; links expire) — not on landing how-to.
- **Export guide:** Phone-only; **2 screenshots**; badges **a** (export to device), **b** (email), **c** (date range), **d** (JSON). No “Before you start” strip; no browser/privacy lede in guide (FAQ later).
- **IG-native** visuals; **no fake global percentiles**.

---

## Export ingest + guide

- [`ExportPicker.jsx`](../frontend/src/components/ExportPicker.jsx) — ZIP or folder; [`exportIngest.js`](../frontend/src/utils/exportIngest.js); [`ExportDataContext.jsx`](../frontend/src/context/ExportDataContext.jsx).
- [`ExportGuide.jsx`](../frontend/src/components/ExportGuide.jsx) — 3 blocks + 2 images; embedded in landing `#how-to` via `hideTitle`.
- **Assets:** `frontend/public/export-guide/phone/03-notification-email.png`, `04c-download-button.png` — redacted, Photopea annotations (Phase 2 **done**).
- [`GuidePage.jsx`](../frontend/src/pages/GuidePage.jsx) — deprecated stub; redirect in App.

### Wrapped flow (unchanged)

1. **Lobby** — [`WrappedLobby.jsx`](../frontend/src/components/WrappedLobby.jsx): warnings + **Start Wrapped** (ack checkbox if needed).
2. **Story player** — [`WrappedStoryPlayer.jsx`](../frontend/src/components/WrappedStoryPlayer.jsx): GSAP progress, tap L/R, hold pause, 7-track shuffle, mute, × exit.
3. **Six slides (0–5):** intro → activity → rhythm → people → inbox → privacy. `WRAPPED_CARD_COUNT = 6`.

See locked Wrapped UX in prior sections of this file (tap-to-advance, no fake percentiles, people chart layout in plain JS, etc.).

---

## Success metrics (landing funnel)

**Not instrumented yet** — Phase Q optional after Phase P.

```
landing_view → cta_primary_click → wrapped_view → export_loaded → wrapped_start → wrapped_complete
```

Event taxonomy in table below (unchanged from Phase 0). No PII in events.

| Event | When |
|-------|------|
| `landing_view` | `/` |
| `cta_primary_click` | Hero/footer/sticky → `/wrapped` |
| `cta_secondary_click` | → `#how-to` |
| `how_to_section_view` | `#how-to` in viewport |
| `wrapped_view` | `/wrapped` |
| `export_loaded` | Files in context |
| `wrapped_start` | Lobby Start |
| `wrapped_complete` | Slide 5 / exit |

---

## Completed work (phases)

| Phase | Status | Summary |
|-------|--------|---------|
| **A–I, K** | Done on `main` | Wrapped SLC (6 slides, GSAP, audio) |
| **0** | Done | Landing IA docs |
| **L** | Done | Routing, `LandingPage` shells, slim `/wrapped` |
| **M** | Done | Hero, trust, landing nav |
| **N** | Done | Six slide preview cards |
| **O** | Done | How-it-works + embedded export guide |
| **Guide Phase 1** | Done | Phone-only, 2-image copy structure |
| **Guide Phase 2** | Done | Redacted PNGs, badges a–d, Photopea playbook in docs |

---

## Roadmap — next sessions

### **Phase P — FAQ + polish** ← **NEXT**

- [`LandingFaq.jsx`](../frontend/src/components/landing/) (new) — export wait, JSON vs HTML, sharing, Meta affiliation, privacy/local-only.
- Final CTA band → `/wrapped`; replace `faq` / `cta` placeholders in [`LandingPage.jsx`](../frontend/src/pages/LandingPage.jsx).
- Mobile + a11y pass; tune anchor scroll offset if needed with full content.
- **Exit:** merge candidate after preview QA.

### **Phase Q — Analytics (optional)**

- `track()` + provider; events above; no PII.

### **Phase R — Merge & ship**

- PR `feat/landing-page` → `main`; production Vercel; docs → “shipped on main”.

### **Phase J — Extra slides (optional)**

- Words slide, insights JSON, avatars — see research doc.

---

## Key files

| Area | Files |
|------|--------|
| Landing | `pages/LandingPage.jsx`, `components/landing/LandingHero.jsx`, `LandingPreview.jsx`, `LandingHowItWorks.jsx`, `LandingHowTo.jsx`, `landingPreviewSlides.js` |
| Routing | `App.jsx`, `config/features.js` |
| Export | `ExportGuide.jsx`, `ExportPicker.jsx`, `public/export-guide/phone/*.png` |
| Wrapped | `WrappedPage.jsx`, `WrappedLobby.jsx`, `WrappedStoryPlayer.jsx`, `wrappedSlideContent.jsx`, `wrappedSlideTimeline.js` |
| Docs | This file, `export-guide-images.md`, `project.mdc` |

**Legacy:** `WrappedStoryDeck.jsx`, unused analysis pages, `GuidePage.jsx` stub.

---

## Known gaps / troubleshooting

- **Blank dev page:** `rm -rf frontend/node_modules/.vite` → restart dev.
- **Anchor scroll under nav:** `scrollToLandingSection` measures `.top-nav` height; may need tweak after Phase P content height changes.
- **Hero phone mock:** Hidden below `md` breakpoint so trust + CTAs stay above fold on mobile.
- **People slide / timeline:** Never import React into `wrappedSlideTimeline.js`; use `peopleRankChartLayout.js`.
- Large ZIP OOM on mobile Safari — future work.

---

## For the next session

1. Read this file + skim [`export-guide-images.md`](export-guide-images.md) if touching screenshots.
2. Branch **`feat/landing-page`** already exists and is pushed — check out and pull.
3. Default work: **Phase P** (FAQ + final CTA).
4. Preview URL on Vercel for `/`, `/#how-to`, `/wrapped` (returning notice + picker), full Wrapped playthrough.
5. Lowercase casual commit messages; **push only when asked**.
6. **`WRAPPED_CARD_COUNT === 6`**.
