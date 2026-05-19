import React, { useState } from "react";

export default function ExportGuide({ defaultOpen = "phone" }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="export-guide card">
      <h2 className="export-guide__title">How to get your Instagram export</h2>
      <p className="export-guide__lede muted">
        Wrapped runs in your browser. Pick the ZIP from Instagram, or the unzipped folder. Your export
        is not uploaded for Wrapped.
      </p>

      <div className="export-guide__tabs" role="tablist" aria-label="Export instructions">
        <button
          type="button"
          role="tab"
          aria-selected={open === "phone"}
          className={`export-guide__tab ${open === "phone" ? "is-active" : ""}`}
          onClick={() => setOpen("phone")}
        >
          Phone
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={open === "desktop"}
          className={`export-guide__tab ${open === "desktop" ? "is-active" : ""}`}
          onClick={() => setOpen("desktop")}
        >
          Desktop browser
        </button>
      </div>

      {open === "phone" ? (
        <ol className="export-guide__steps">
          <li>
            Instagram → <strong>Settings</strong> → <strong>Accounts Centre</strong> →{" "}
            <strong>Your information and permissions</strong> → <strong>Export your information</strong>.
          </li>
          <li>
            Create export → <strong>Export to device</strong> → format <strong>JSON</strong>. For date
            range, choose about <strong>6 months to 1 year</strong> — enough for Wrapped without a huge
            file that is slow on your phone.
          </li>
          <li>Wait for the notification (can take hours or days). Download when ready — link expires after a few days.</li>
          <li>
            Save the <strong>.zip</strong> to the <strong>Files</strong> app. Here, tap <strong>Choose ZIP</strong>{" "}
            (easiest). Or unzip in Files (long-press the zip → uncompress), then tap <strong>Choose folder</strong>.
          </li>
        </ol>
      ) : (
        <ol className="export-guide__steps">
          <li>
            Same path in Instagram: Accounts Centre → <strong>Export your information</strong> →{" "}
            <strong>Export to device</strong>, format <strong>JSON</strong>. Set the date range to about{" "}
            <strong>6 months to 1 year</strong> for the best balance of story detail and download size.
          </li>
          <li>Download the <strong>.zip</strong> when Instagram emails you that it is ready.</li>
          <li>
            On this site: <strong>Choose ZIP</strong> and select the file, or unzip on your computer and use{" "}
            <strong>Choose folder</strong> (select the folder that contains{" "}
            <code className="export-guide__code">your_instagram_activity</code>).
          </li>
        </ol>
      )}
    </div>
  );
}
