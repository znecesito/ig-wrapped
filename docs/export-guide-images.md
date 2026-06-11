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
| `phone/03-notification-email.png` | **1. Set up your export** | Single Meta screen with annotated callouts: **a** Export to device, **b** notification email, **c** date range, **d** JSON. User taps **Start export**. |
| `phone/04c-download-button.png` | **2. Wait, then download** | **Export your information** with **Available downloads** card and **Download** highlighted. |

Block **3. Load into ig-wrapped** is text only (Choose ZIP on `/wrapped`; success = “Data loaded” + Start Wrapped).

---

## Phase 2 — redact + annotations (manual, Photopea only)

**This step is manual.** The repo cannot auto-redact or redesign your PNGs. Use **[Photopea](https://www.photopea.com)** (free, browser — works like Photoshop) for the full workflow: clean up, redact, annotate, export. No Figma account required.

**Why manual?** Real Meta UI must stay accurate; AI redraws fake screens. You control PII before anything is public.

### What you need

| Item | Notes |
| --- | --- |
| [Photopea](https://www.photopea.com) | Chrome/Safari; allow clipboard if paste screenshots |
| Source PNGs or fresh phone screenshots | Clean capture without markup is easiest |
| Brand color | `#e11d48` (rose) for rings and badges |
| ~30–45 min | Both images, first time |

### Annotation style (match ig-wrapped)

| Token | Value |
| --- | --- |
| Ring stroke | **2 px**, `#e11d48`, rounded corners **8 px** |
| Ring fill (optional) | `#e11d48` at **15% opacity** |
| Badge | Circle **22 px**, fill `#e11d48`, label **white** **11 px bold** |
| Badge labels (image 1) | **a**, **b**, **c**, **d** — matches `ExportGuide.jsx` captions |
| Image 2 | One ring around **Download** only (no badge required) |

Keep **≤ 4** callouts on image 1. No huge arrows or neon colors.

---

## Photopea-only workflow (overview)

```
Open PNG in Photopea
        ↓
[Optional] Remove old pink marks / labels (Clone Stamp)
        ↓
Redact PII on copy of screenshot layer
        ↓
New folder "annotations" — rings + badges (vector shapes)
        ↓
Export As → PNG
        ↓
Replace files in frontend/public/export-guide/phone/
        ↓
Verify localhost /#how-to → commit
```

---

## Photopea basics (one-time setup)

1. Go to [photopea.com](https://www.photopea.com) → **File → Open** → pick your screenshot.
2. Open the **Layers** panel (right side). If you don’t see it: **Window → Layers**.
3. **Rename** the background layer to `screenshot` (double-click the layer name).
4. **Duplicate** the screenshot layer (**Layer → Duplicate Layer**) → name the copy `screenshot redacted`. Work on the copy; keep the original hidden as backup (click the eye icon).
5. For all annotation shapes, use **new layers** above `screenshot redacted` so you can nudge rings without touching the UI.

**Useful shortcuts (Mac / Windows)**

| Action | Mac | Windows |
| --- | --- | --- |
| Zoom | Cmd + / Cmd − | Ctrl + / Ctrl − |
| Undo | Cmd + Z | Ctrl + Z |
| Free Transform (resize shape) | Cmd + T | Ctrl + T |
| Sample for Clone Stamp | Option + click | Alt + click |

---

## Step A — Remove old markup (if reusing current PNGs)

Skip this if you took a **fresh screenshot** with no pink lines or text.

1. Select layer **`screenshot redacted`**.
2. Toolbar → **Clone Stamp** (stamp icon).
3. Top bar: brush **~25 px**, hardness **0%**, opacity **100%**.
4. **Option/Alt + click** on clean gray/white UI near a pink line to sample.
5. Paint over old pink underlines and handwritten labels.
6. For tricky edges, use a smaller brush and sample often.

**Heal Brush** (band-aid icon) also works on flat backgrounds — click and drag over small marks.

---

## Step B — Redact PII

On layer **`screenshot redacted`**, hide anything that identifies you:

| Area | Photopea method |
| --- | --- |
| Profile photo | Rectangular marquee around face → **Filter → Blur → Gaussian Blur** → radius **15–25** |
| Display name / @handle | Marquee → blur **or** add layer above, fill selection with `#e2e8f0` (**Edit → Fill** → color `#e2e8f0`) |
| Email in **Notify** row | Marquee over email → blur **or** paint `#f1f5f9` rectangle on a new layer |

**Solid bar (cleaner than heavy blur):**

1. **New layer** (name it `redaction`).
2. Rectangular marquee over text.
3. **Edit → Fill** → `#e2e8f0` → OK.
4. **Select → Deselect**.

Repeat for both images. Image 2: redact profile photo and @handle on the download card; date range is optional.

---

## Step C — Draw professional rings (rounded rectangles)

Do this on **new layers** above redactions. One layer per ring (easier to edit) or one layer named `rings`.

### Single callout ring

1. Toolbar → **Rectangle tool** (U). Top bar: **Shape**, not Path or Pixels.
2. Set **Fill** to empty (white square with red slash) or `#e11d48` at 15% opacity:
   - Click the fill swatch → set color `#e11d48` → opacity **15%**.
3. Set **Stroke** to `#e11d48`, width **2 px**.
4. Set corner radius (top bar) **8 px** (rounded rectangle).
5. Drag a box around the target **value** (e.g. the word **JSON**), not the entire card.
6. **Move tool** (V) to reposition. **Cmd/Ctrl + T** to resize.

### Number badge (a, b, c, d)

1. **New layer** → name `badge a` (etc.).
2. Toolbar → **Ellipse tool** (U) → **Shape**.
3. Fill `#e11d48`, no stroke. Hold **Shift** while dragging a **~22 px** circle (place at top-left corner of the ring, slightly overlapping).
4. Toolbar → **Type tool** (T) → click on the circle → type **a** (small label).
5. Character panel: **Arial** or **Inter** if available, **11 px**, **Bold**, color **white**, centered.
6. If text sits on its own layer, merge badge + text: select both layers → **Layer → Merge Layers**.

Duplicate the badge layer for **b**, **c**, **d** (faster than redrawing):

1. Right-click badge layer → **Duplicate Layer**.
2. **Move tool** → drag to next ring.
3. Double-click text with Type tool → change to **b**, etc.

---

## Image 1 — `03-notification-email.png`

**Four rings + four badges:**

| Badge | Ring around |
| --- | --- |
| **a** | “Export to Device · Once” row |
| **b** | Notify / email row |
| **c** | “Last year” (or your date range) under Date range |
| **d** | “JSON” under Format |

Leave **Start export** unmarked — the guide caption already mentions it.

**Export:**

1. **Image → Trim** → only if you added canvas padding; usually skip.
2. **File → Export As → PNG**.
3. Check **width** ~750–900 px (resize with **Image → Image Size** if your source is huge — keep aspect ratio).
4. Save as `03-notification-email.png`.
5. Copy into `frontend/public/export-guide/phone/`.

**QA at 360 px width:** badges readable, rings don’t overlap, PII gone.

---

## Image 2 — `04c-download-button.png`

**One ring** around the **Download** button in Available downloads.

1. Same rectangle tool settings (rose stroke 2 px, 8 px radius, optional 15% fill).
2. Hug the button edges with a few pixels padding.
3. Skip a badge unless you want a tiny “↓” — the button label is enough.
4. **File → Export As → PNG** → `04c-download-button.png` → replace in repo.

---

## Step D — Replace files and verify

1. Overwrite:
   - `frontend/public/export-guide/phone/03-notification-email.png`
   - `frontend/public/export-guide/phone/04c-download-button.png`
2. `cd frontend && npm run dev` → open `http://localhost:5173/#how-to`.
3. Confirm both images load, captions still match badge numbers.
4. **Commit only after redaction** — never push unredacted handle/email to a public remote.

Optional rename (requires updating paths in `ExportGuide.jsx`):

- `01-export-setup.png`
- `02-download-ready.png`

---

## Phase 2 checklist

- [ ] Photopea: old markup removed or fresh screenshots used
- [ ] PII redacted (handle, email, photo) on both PNGs
- [ ] Rings: 2 px `#e11d48`, 8 px corners, ≤ 4 on image 1
- [ ] Badges: a, b, c, d on image 1; Download ring on image 2
- [ ] Exported ~750–900 px wide, reasonable file size (&lt; ~500 KB each if possible)
- [ ] Verified on mobile landing `#how-to`
- [ ] Committed and pushed

---

## Troubleshooting (Photopea)

| Problem | Fix |
| --- | --- |
| Rectangle draws filled black | Top bar: switch to **Shape**; set fill to empty or 15% rose |
| Can’t see new shapes | Check Layers — shape may be below screenshot; drag layer up |
| Text too big | Type tool → highlight → 11 px bold |
| Export looks blurry | Don’t upscale; export at native screenshot width |
| Blur redaction looks messy | Use solid `#e2e8f0` bar on separate layer instead |

---

## Alternative: Figma (optional)

If you prefer a design tool later, the same style tokens apply (rose rings, badges). Figma is optional — **Photopea alone is enough** for redaction + professional-enough annotations.

1. New frame → place embedded PNG → lock layer.
2. Rounded rectangle + ellipse badges → export PNG @2x.
3. Same file names and checklist as above.

---

## Conventions

- **Format**: `.png`, ~750–900 px wide for phone captures.
- **Display**: CSS class `export-guide__shot--guide` — `clamp(260px, 92%, 420px)` wide so annotated screenshots stay readable on mobile.
- **Captions**: `figcaption` under each image maps badge letters (a, b, c, d) to plain English.
- **Privacy**: do not commit unredacted username/email to a public repo.

## Adding a screenshot later

1. Drop the file under `frontend/public/export-guide/phone/`.
2. Add a `<GuideShot />` in `ExportGuide.jsx` with `alt`, optional `caption`, and `modifier="export-guide__shot--guide"` if it is a full-width annotated capture.
