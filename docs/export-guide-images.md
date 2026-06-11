# Export guide screenshots

The landing **How to export** section uses **two annotated phone screenshots** in `frontend/public/export-guide/phone/`. Files are served at the site root (e.g. `/export-guide/phone/03-notification-email.png`).

Copy and layout live in `frontend/src/components/ExportGuide.jsx` — phone only (no desktop tab).

## Current files (2)

```
frontend/public/export-guide/
  phone/
    03-notification-email.png   # Setup screen (export to device, JSON, date range, notify email)
    04c-download-button.png     # Available downloads + Download button
```

| File | Guide block | What it shows |
| --- | --- | --- |
| `phone/03-notification-email.png` | **1. Set up your export** | Single Meta screen with annotated callouts: **2c** Export to device, **2d** JSON, **2e** date range, **3** notification email. User taps **Start export**. |
| `phone/04c-download-button.png` | **2. Wait, then download** | **Export your information** with **Available downloads** card and **Download** highlighted. |

Block **3. Load into ig-wrapped** is text only (Choose ZIP on `/wrapped`; success = “Data loaded” + Start Wrapped).

---

## Phase 2 — redact + professional annotations (manual)

**This step is manual.** The repo cannot auto-redact or auto-redesign your PNGs — an agent should not paint over or regenerate Meta UI. You edit the real captures in **Photopea** and/or **Figma**, then replace the two files in `frontend/public/export-guide/phone/`.

**Why manual tools?**

| Task | Why not AI / code |
| --- | --- |
| Redaction | Must stay pixel-accurate Meta UI; blur boxes need human placement |
| Annotations | Highlights must align to real controls; AI redraws fake Instagram screens |
| Export | You control PII before anything is pushed to a public repo |

**Recommended free stack**

| Tool | Use for |
| --- | --- |
| **[Figma](https://figma.com)** (free) | **Best for professional annotations** — consistent strokes, numbered badges, export @2x PNG |
| **[Photopea](https://www.photopea.com)** (free, browser) | Redaction, removing old pink marks, clone/heal, quick exports |
| **Phone screenshot** (optional) | Fresh capture **without** old annotations = cleanest starting point |

Use **Figma** if you want polished callouts. Use **Photopea only** if you just need redaction + simple rounded rectangles.

---

### Annotation style (match ig-wrapped)

Keep callouts **minimal** — one emphasis per control, same system on both images.

| Token | Value | Use |
| --- | --- | --- |
| Accent | `#e11d48` | Ring / badge fill (brand rose) |
| Ring stroke | 2–3 px, `#e11d48` | Rounded rect around a row (Export to device, JSON, etc.) |
| Ring fill | `#e11d48` at **12–18% opacity** | Optional soft tint inside ring |
| Badge | 20–24 px circle, fill `#e11d48`, text **white** 11–12 px bold | Step number in corner of ring |
| Download emphasis | 3 px vertical bars or full rounded rect on **Download** button only | Image 2 |

**Numbering (pick one and stay consistent)**

- **Option A — Keep guide labels:** badges **2c**, **2d**, **2e**, **3** (matches current `ExportGuide.jsx` captions).
- **Option B — Simpler:** badges **1–4** top-to-bottom on image 1 only — if you choose this, update the figcaption in `ExportGuide.jsx` to match.

**Do not:** heavy drop shadows, neon colors, arrows crossing the whole screen, or more than **four** callouts on image 1.

---

### Workflow overview

```
[Optional: new clean screenshot from phone]
        ↓
Redact PII (Photopea or Figma)
        ↓
Remove old hand-drawn pink / text (clone stamp or start from clean capture)
        ↓
Add Figma annotation layers
        ↓
Export PNG → replace files in public/export-guide/phone/
        ↓
Verify on localhost /#how-to
        ↓
Commit (only after redaction)
```

---

### Step-by-step — Image 1 (`03-notification-email.png`)

**Goal:** One screen — export to device, JSON, date range, notification email — with four clear callouts + visible **Start export**.

#### A. Start clean

1. **Best:** Take a **new screenshot** from Instagram with **no** markup (same screen as today).
2. **Or:** Open the existing PNG in Photopea and remove old pink underlines and **2c / 2d / 2e / 3** text using **Clone Stamp** (toolbar, hold Alt to sample nearby background).

#### B. Redact PII (Photopea or Figma)

Redact anything that identifies you:

| Area | Action |
| --- | --- |
| Profile photo | Optional blur or generic gray circle |
| Display name / @handle | Blur or solid bar `#e2e8f0` |
| Email in **Notify** row | Blur or replace with `you@example.com` in same font (Figma text overlay) |

**Photopea:** Rectangular marquee → **Filter → Blur → Gaussian Blur** (radius ~20), or new layer filled `#f1f5f9` over the text.

#### C. Annotate in Figma (professional)

1. **File → New design** → frame width **390 px** (iPhone logical width) or match your screenshot width.
2. **Place image:** drag PNG onto canvas (**File → Place embedded** or paste).
3. Lock the screenshot layer.
4. For each target row, add a **rounded rectangle** (corner radius ~8 px):
   - **Stroke only:** `#e11d48`, 2 px, no fill — **or** stroke + 15% rose fill.
   - Size the rect to the **value row** (e.g. “JSON”, “Last year”), not the whole card.
5. Add a **number badge** (ellipse 22 px, fill `#e11d48`, white label) anchored top-left of each ring:
   - **2c** → “Export to Device · Once” row  
   - **2d** → “JSON” under Format  
   - **2e** → “Last year” (or your date range) under Date range  
   - **3** → “Notify” / email row  
6. **Do not** ring “Start export” unless you want a fifth callout — the caption already tells users to tap it.
7. Select frame → **Export** → PNG, **2x** if available → save as `03-notification-email.png`.

#### D. Check at phone size

Zoom to ~360 px wide. Labels must stay readable; rings must not overlap each other.

---

### Step-by-step — Image 2 (`04c-download-button.png`)

**Goal:** Show **Available downloads** and make **Download** obvious.

#### A. Clean + redact

Same as image 1: fresh capture or clone away old pink bars on **Download**.

Redact:

| Area | Action |
| --- | --- |
| Profile photo / @handle | Same as image 1 |
| Date range line | OK to keep if no PII; blur if it bothers you |

#### B. Annotate in Figma

1. Place screenshot on locked layer.
2. **One** callout on the **Download** button:
   - Rounded rect hugging the button (stroke `#e11d48` 2 px), **or**
   - Two vertical rose bars left/right of button (like your current emphasis, but straight 3 px vectors).
3. Optional single badge **“Download”** or no badge — the UI already says Download.
4. Export PNG → `04c-download-button.png`.

---

### Photopea-only shortcut (redaction + simple rings)

If you skip Figma:

1. Open PNG in Photopea.
2. Redact (above).
3. **New layer** for each ring: **Rectangle select** → **Edit → Stroke** (2 px, `#e11d48`) → corner radius via **Select → Modify → Smooth** or draw rounded rect with shape tool.
4. **Type tool** for small white-on-rose badges (duplicate layer style for consistency).
5. **File → Export As → PNG**.

Rings will look less polished than Figma but acceptable for v1.

---

### Replace files in the repo

1. Overwrite (same names, no code change):
   - `frontend/public/export-guide/phone/03-notification-email.png`
   - `frontend/public/export-guide/phone/04c-download-button.png`
2. Optional rename (requires updating `ExportGuide.jsx` paths):
   - `01-export-setup.png`
   - `02-download-ready.png`
3. Run `cd frontend && npm run dev` → `/#how-to` → confirm both images load, text still matches rings.
4. **Commit only redacted files** — never push username/email to a public remote.

---

### Phase 2 checklist

- [ ] PII redacted on both PNGs (handle, email, photo if needed)
- [ ] Old hand-drawn markup removed or replaced
- [ ] Callouts use consistent rose `#e11d48` system
- [ ] Image 1: four callouts (2c, 2d, 2e, 3) or relabeled 1–4 + caption updated
- [ ] Image 2: Download clearly emphasized
- [ ] Exported ~750–900 px wide PNG, reasonable file size (&lt; ~500 KB each if possible)
- [ ] Verified on mobile landing `#how-to`
- [ ] Committed and pushed

---

## Conventions

- **Format**: `.png`, ~750–900 px wide for phone captures.
- **Display**: CSS class `export-guide__shot--guide` — `clamp(260px, 92%, 420px)` wide so annotated screenshots stay readable on mobile.
- **Captions**: `figcaption` under each image maps label numbers (2c, 2d, etc.) to plain English.
- **Privacy**: do not commit unredacted username/email to a public repo.

## Adding a screenshot later

1. Drop the file under `frontend/public/export-guide/phone/`.
2. Add a `<GuideShot />` in `ExportGuide.jsx` with `alt`, optional `caption`, and `modifier="export-guide__shot--guide"` if it is a full-width annotated capture.
