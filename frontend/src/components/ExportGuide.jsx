import React from "react";

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

export default function ExportGuide({ hideTitle = false }) {
  return (
    <div className="export-guide card">
      {hideTitle ? null : (
        <h2 className="export-guide__title m-0 mb-1 text-[1.15rem] font-bold text-ink">
          How to get your Instagram export
        </h2>
      )}

      <section className="export-guide__block export-guide__block--first" aria-labelledby="export-guide-setup">
        <h3 id="export-guide-setup" className="export-guide__block-title">
          1. Set up your export
        </h3>
        <p className="export-guide__block-lede">
          In the Instagram app: <strong>Settings</strong> → <strong>Accounts Center</strong> →{" "}
          <strong>Your information and permissions</strong> →{" "}
          <strong>Export your information</strong>. Tap <strong>Create export</strong>, choose your
          Instagram account, then confirm the settings on the screen below.
        </p>
        <GuideShot
          src="/export-guide/phone/03-notification-email.png"
          alt="Instagram export setup screen showing export to device, JSON format, date range, and notification email"
          modifier="export-guide__shot--guide"
          caption={
            "On this screen: Export to device (a), notification email (b), date range (c), and JSON format (d). Tap Start export when everything matches."
          }
        />
      </section>

      <section className="export-guide__block" aria-labelledby="export-guide-download">
        <h3 id="export-guide-download" className="export-guide__block-title">
          2. Wait, then download
        </h3>
        <p className="export-guide__block-lede">
          Meta will email you when the export is ready — subject line{" "}
          <strong>&ldquo;Your Meta information download is ready&rdquo;</strong>. It can take hours
          or days. The download link expires after a few days, so don&apos;t wait too long.
        </p>
        <p className="export-guide__block-lede">
          When you get the email, open Instagram again and go back to{" "}
          <strong>Accounts Center</strong> → <strong>Export your information</strong>. Under{" "}
          <strong>Available downloads</strong>, tap <strong>Download</strong>.
        </p>
        <GuideShot
          src="/export-guide/phone/04c-download-button.png"
          alt="Export your information page with Available downloads and the Download button highlighted"
          modifier="export-guide__shot--guide"
          caption="Tap Download on your export under Available downloads. Save the .zip somewhere you can find it (Downloads, Files, or your phone's file manager)."
        />
      </section>

      <section className="export-guide__block" aria-labelledby="export-guide-load">
        <h3 id="export-guide-load" className="export-guide__block-title">
          3. Load it into ig-wrapped
        </h3>
        <p className="export-guide__block-lede">
          Open <strong>Wrapped</strong> on this site and tap <strong>Choose ZIP</strong>. Pick the
          export from your phone.
        </p>
        <p className="export-guide__block-lede">
          Prefer a folder? Unzip the export on your phone first, then tap{" "}
          <strong>Choose folder</strong> and select the folder that contains{" "}
          <code className="export-guide__code">your_instagram_activity</code>.
        </p>
        <p className="export-guide__done">
          You&apos;re ready when Wrapped shows <strong>Data loaded</strong> with a JSON file count —
          then tap <strong>Start Wrapped</strong>.
        </p>
      </section>
    </div>
  );
}
