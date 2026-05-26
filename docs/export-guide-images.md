# Export guide screenshots

The "How to export" guide pulls images from `frontend/public/export-guide/`. Anything in that folder is served at the site root (so `frontend/public/export-guide/phone/02d-format-json.png` is reachable at `/export-guide/phone/02d-format-json.png` in dev and prod). The `<ExportGuide />` component hides any `<figure>` whose `<img>` 404s, so missing screenshots don't break the layout — you can drop them in over time.

## Drop folder

```
frontend/public/export-guide/
  phone/
    01-accounts-center.png
    02c-export-to-device.png
    02d-format-json.png
    02e-date-range.png
    03-notification-email.png
    04a-email-notification.png
    04c-download-button.png
    05-save-to-files.png
    06-choose-zip.png
    06a-uncompress.png
  desktop/
    01-accounts-center.png
    02c-format-json.png
    02d-date-range.png
    03-notification-email.png
    04a-email-notification.png
    04c-download-button.png
    05-choose-zip.png
    05a-unzipped-folder.png
  data-loaded.png
```

## What each screenshot should show

### Phone (10 slots)

| File | Step in guide | What to capture |
| --- | --- | --- |
| `phone/01-accounts-center.png` | Phone · 1 | Instagram **Settings** with **Accounts Center** highlighted at the top. |
| `phone/02c-export-to-device.png` | Phone · 2c | The destination chooser with **Export to device** selected (not "Transfer to a service"). |
| `phone/02d-format-json.png` | Phone · 2d | Format chooser with **JSON** selected. Highest priority. |
| `phone/02e-date-range.png` | Phone · 2e | Date range picker showing about 6 months to 1 year. |
| `phone/03-notification-email.png` | Phone · 3 | The export confirmation screen showing which email will receive the notification. |
| `phone/04a-email-notification.png` | Phone · 4a | The Meta email in your inbox with the subject **"Your Meta information download is ready"** visible. |
| `phone/04c-download-button.png` | Phone · 4c | Accounts Center page after re-login showing the **Download** button. |
| `phone/05-save-to-files.png` | Phone · 5 | iOS share sheet or Files app saving the `.zip`. |
| `phone/06-choose-zip.png` | Phone · 6 | The iOS Files picker after tapping **Choose ZIP**, with the export's `.zip` highlighted. |
| `phone/06a-uncompress.png` | Phone · 6a | The Files long-press menu showing **Uncompress** (or the resulting unzipped folder). |

### Desktop browser (8 slots)

| File | Step in guide | What to capture |
| --- | --- | --- |
| `desktop/01-accounts-center.png` | Desktop · 1 | The **Export your information** page in a desktop browser. |
| `desktop/02c-format-json.png` | Desktop · 2c | Format radio set to **JSON**. |
| `desktop/02d-date-range.png` | Desktop · 2d | Date range set to about 6 months to 1 year. |
| `desktop/03-notification-email.png` | Desktop · 3 | Export confirmation showing the notification email. |
| `desktop/04a-email-notification.png` | Desktop · 4a | The Meta email in your inbox with subject **"Your Meta information download is ready"**. |
| `desktop/04c-download-button.png` | Desktop · 4c | Accounts Center page after re-login showing the **Download** button. |
| `desktop/05-choose-zip.png` | Desktop · 5 | The desktop file picker after clicking **Choose ZIP** with the export's `.zip` selected. |
| `desktop/05a-unzipped-folder.png` | Desktop · 5a | The unzipped export folder showing the `your_instagram_activity` directory inside. |

### Shared (1 slot)

| File | Step in guide | What to capture |
| --- | --- | --- |
| `data-loaded.png` | Success block (both tabs) | The `ExportPicker` "Data loaded from ZIP (N JSON files)" pill so users know what success looks like. |

## Conventions

- **Filenames**: lowercase, hyphenated, prefixed with the step they illustrate. Renumber prefixes if the guide outline shifts.
- **Format**: `.png` for sharp UI captures. Use `.jpg` (~q85) or `.webp` if a single image would otherwise be multi-MB.
- **Sizes**: ~750–900 px wide for phone shots, ~1100–1400 px wide for desktop. CSS uses `clamp(220px, 55%, 360px)` for normal shots and `clamp(260px, 75%, 520px)` for the wide success shot, so larger sources stay crisp on retina without being huge on screen.
- **Privacy**: redact your username, email, and any DM previews before committing. The guide is shipped publicly.
- **Adding a new screenshot**: drop the file into the right subfolder, then add a `<GuideShot src="/export-guide/..." alt="..." />` entry in `frontend/src/components/ExportGuide.jsx` next to the matching step.
