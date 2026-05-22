import { toPng } from "html-to-image";

export const WRAPPED_EXPORT_WIDTH = 1080;
export const WRAPPED_EXPORT_HEIGHT = 1920;

const CAPTURE_HOST_CLASS = "wrapped-card-capture-host";
const CAPTURING_CLASS = "wrapped-card--capturing";

/**
 * Rasterize a wrapped story card to PNG at 1080×1920 (Instagram story size).
 * Clones into an off-screen stage; per-theme opaque backgrounds approximate viewport + glass
 * (backdrop-filter is omitted — not supported in export).
 */
export async function captureWrappedCardPng(cardElement) {
  if (!cardElement?.cloneNode) {
    throw new Error("Could not capture this slide.");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const host = document.createElement("div");
  host.className = `wrapped-story ${CAPTURE_HOST_CLASS}`;
  host.setAttribute("aria-hidden", "true");

  const stage = document.createElement("div");
  stage.className = `${CAPTURE_HOST_CLASS}__stage`;

  const clone = cardElement.cloneNode(true);
  clone.classList.remove(
    "wrapped-card--from-next",
    "wrapped-card--from-prev"
  );
  clone.classList.add("wrapped-card--visible", CAPTURING_CLASS);
  stage.appendChild(clone);
  host.appendChild(stage);
  document.body.appendChild(host);

  try {
    const dataUrl = await toPng(stage, {
      width: WRAPPED_EXPORT_WIDTH,
      height: WRAPPED_EXPORT_HEIGHT,
      pixelRatio: 1,
      cacheBust: true,
      skipAutoScale: false
    });
    const blob = await dataUrlToBlob(dataUrl);
    return blob;
  } finally {
    host.remove();
  }
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}
