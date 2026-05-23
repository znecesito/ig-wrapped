import { toPng } from "html-to-image";

export const WRAPPED_EXPORT_WIDTH = 1080;
export const WRAPPED_EXPORT_HEIGHT = 1920;

/**
 * Rasterize the off-screen export frame (1080×1920) built for PNG delivery.
 * The interactive scroller card is not photographed — see WrappedSlideExport.jsx.
 */
export async function captureWrappedCardPng(exportCardElement) {
  if (!exportCardElement?.getBoundingClientRect) {
    throw new Error("Could not capture this slide.");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const dataUrl = await toPng(exportCardElement, {
    width: WRAPPED_EXPORT_WIDTH,
    height: WRAPPED_EXPORT_HEIGHT,
    pixelRatio: 1,
    cacheBust: true
  });

  const res = await fetch(dataUrl);
  return res.blob();
}
