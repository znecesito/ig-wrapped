import React, { useState } from "react";

function GuideShot({ src, alt, caption, modifier }) {
  return (
    <figure className={`export-guide__shot${modifier ? ` ${modifier}` : ""}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          const fig = e.currentTarget.closest("figure");
          if (fig) fig.style.display = "none";
        }}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

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
            Open Instagram → <strong>Settings</strong> → <strong>Accounts Center</strong>.
            <GuideShot
              src="/export-guide/phone/01-accounts-center.png"
              alt="Accounts Center entry inside Instagram Settings on phone"
            />
          </li>
          <li>
            Set up the export.
            <ol className="export-guide__substeps">
              <li>
                <strong>Your information and permissions</strong> →{" "}
                <strong>Export your information</strong>.
              </li>
              <li>
                Tap <strong>Create export</strong> → select your{" "}
                <strong>Instagram account</strong>.
              </li>
              <li>
                Pick <strong>Export to device</strong> (not "Transfer to a service").
                <GuideShot
                  src="/export-guide/phone/02c-export-to-device.png"
                  alt="Export destination set to Export to device"
                />
              </li>
              <li>
                Format: <strong>JSON</strong> — not HTML.
                <GuideShot
                  src="/export-guide/phone/02d-format-json.png"
                  alt="Export format set to JSON"
                  caption="Make sure JSON is selected — HTML exports will not work with Wrapped."
                />
              </li>
              <li>
                Date range: <strong>6 months to 1 year</strong>.
                <GuideShot
                  src="/export-guide/phone/02e-date-range.png"
                  alt="Date range set to about 6 months to 1 year"
                />
              </li>
            </ol>
          </li>
          <li>
            Heads up: make sure to select an email you actively use so notifications from Meta reach
            you.
            <GuideShot
              src="/export-guide/phone/03-notification-email.png"
              alt="Notification email shown on the export confirmation screen"
            />
          </li>
          <li>
            Begin the download process.
            <ol className="export-guide__substeps">
              <li>
                Wait for the notification to arrive (it may take hours or days). The email subject
                will be <strong>"Your Meta information download is ready"</strong>.
                <GuideShot
                  src="/export-guide/phone/04a-email-notification.png"
                  alt="Meta email notifying that the export is ready to download"
                />
              </li>
              <li>
                Once the notification arrives, log back in to <strong>Accounts Center</strong> by
                following steps 1–2a.
              </li>
              <li>
                Tap <strong>Download</strong>. The link expires after a few days, so don't wait too
                long.
                <GuideShot
                  src="/export-guide/phone/04c-download-button.png"
                  alt="Download button on the export confirmation page"
                />
              </li>
            </ol>
          </li>
          <li>
            Save the <strong>.zip</strong> to the <strong>Files</strong> app.
            <GuideShot
              src="/export-guide/phone/05-save-to-files.png"
              alt="Saving the Instagram export ZIP to the iOS Files app"
            />
          </li>
          <li>
            Come back here → tap <strong>Choose ZIP</strong> and pick the export from Files.
            <GuideShot
              src="/export-guide/phone/06-choose-zip.png"
              alt="Choosing the ZIP from the iOS Files picker"
            />
            <ol className="export-guide__substeps">
              <li>
                Or, if you'd rather load a folder: long-press the zip in Files → <em>Uncompress</em>,
                then tap <strong>Choose folder</strong>.
                <GuideShot
                  src="/export-guide/phone/06a-uncompress.png"
                  alt="Uncompressing the export zip in the iOS Files app"
                />
              </li>
            </ol>
          </li>
        </ol>
      ) : (
        <ol className="export-guide__steps">
          <li>
            Instagram (web) → <strong>Settings</strong> → <strong>Accounts Center</strong> →{" "}
            <strong>Your information and permissions</strong> →{" "}
            <strong>Export your information</strong>.
            <GuideShot
              src="/export-guide/desktop/01-accounts-center.png"
              alt="Accounts Center Export your information page in a desktop browser"
            />
          </li>
          <li>
            Set up the export.
            <ol className="export-guide__substeps">
              <li>
                Click <strong>Create export</strong> → select your{" "}
                <strong>Instagram account</strong>.
              </li>
              <li>
                Pick <strong>Export to device</strong> (not "Transfer to a service").
              </li>
              <li>
                Format: <strong>JSON</strong> — not HTML.
                <GuideShot
                  src="/export-guide/desktop/02c-format-json.png"
                  alt="Export format set to JSON in the desktop flow"
                  caption="JSON only — HTML exports cannot be parsed by Wrapped."
                />
              </li>
              <li>
                Date range: <strong>6 months to 1 year</strong>.
                <GuideShot
                  src="/export-guide/desktop/02d-date-range.png"
                  alt="Date range set to about 6 months to 1 year in the desktop flow"
                />
              </li>
            </ol>
          </li>
          <li>
            Heads up: make sure to select an email you actively use so notifications from Meta reach
            you.
            <GuideShot
              src="/export-guide/desktop/03-notification-email.png"
              alt="Notification email shown on the export confirmation screen"
            />
          </li>
          <li>
            Begin the download process.
            <ol className="export-guide__substeps">
              <li>
                Wait for the notification to arrive (it may take hours or days). The email subject
                will be <strong>"Your Meta information download is ready"</strong>.
                <GuideShot
                  src="/export-guide/desktop/04a-email-notification.png"
                  alt="Meta email notifying that the export is ready to download"
                />
              </li>
              <li>
                Once the notification arrives, log back in to <strong>Accounts Center</strong> by
                following step 1.
              </li>
              <li>
                Click <strong>Download</strong>. The link expires after a few days, so don't wait too
                long.
                <GuideShot
                  src="/export-guide/desktop/04c-download-button.png"
                  alt="Download button on the export confirmation page"
                />
              </li>
            </ol>
          </li>
          <li>
            On this site: click <strong>Choose ZIP</strong> and select the export.
            <GuideShot
              src="/export-guide/desktop/05-choose-zip.png"
              alt="Choosing the ZIP from the desktop file picker"
            />
            <ol className="export-guide__substeps">
              <li>
                Or, if you'd rather load a folder: unzip the export, then click{" "}
                <strong>Choose folder</strong> and pick the folder that contains{" "}
                <code className="export-guide__code">your_instagram_activity</code>.
                <GuideShot
                  src="/export-guide/desktop/05a-unzipped-folder.png"
                  alt="Unzipped Instagram export folder containing your_instagram_activity"
                />
              </li>
            </ol>
          </li>
        </ol>
      )}

      <div className="export-guide__success">
        <p className="export-guide__success-title">What success looks like</p>
        <GuideShot
          src="/export-guide/data-loaded.png"
          alt="ig-wrapped showing the data-loaded indicator with a JSON file count"
          modifier="export-guide__shot--wide"
          caption={"You're ready when the picker shows \u201CData loaded\u201D with a JSON file count."}
        />
      </div>
    </div>
  );
}
