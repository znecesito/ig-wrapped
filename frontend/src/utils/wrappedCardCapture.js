import { toPng } from "html-to-image";

export const WRAPPED_EXPORT_WIDTH = 1080;
export const WRAPPED_EXPORT_HEIGHT = 1920;

/**
 * Rasterize the visible story card at its natural on-screen layout (no forced resize),
 * then upscale the bitmap to 1080×1920 for Stories. Avoids passing width/height to
 * html-to-image, which reflows the clone and can truncate text.
 */
export async function captureWrappedCardPng(cardElement) {
  if (!cardElement?.getBoundingClientRect) {
    throw new Error("Could not capture this slide.");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  cardElement.scrollIntoView({ block: "nearest", behavior: "auto" });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);

  const dataUrl = await toPng(cardElement, {
    pixelRatio,
    cacheBust: true
  });

  return upscaleToStorySize(dataUrl);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not process slide image."));
    img.src = src;
  });
}

async function upscaleToStorySize(dataUrl) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = WRAPPED_EXPORT_WIDTH;
  canvas.height = WRAPPED_EXPORT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process slide image.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, WRAPPED_EXPORT_WIDTH, WRAPPED_EXPORT_HEIGHT);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode slide image."))),
      "image/png"
    );
  });
  return blob;
}
