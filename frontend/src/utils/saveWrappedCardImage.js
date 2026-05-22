/**
 * Deliver a wrapped card PNG: Web Share on iOS (Save Image / Instagram), download on desktop,
 * or return a blob URL for an in-app preview fallback.
 */
export async function saveWrappedCardImage(blob, slideNumber) {
  const name = `ig-wrapped-slide-${slideNumber}.png`;
  const file = new File([blob], name, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "ig-wrapped" });
      return { method: "share" };
    } catch (err) {
      if (err?.name === "AbortError") {
        return { method: "cancelled" };
      }
      throw err;
    }
  }

  if (typeof document !== "undefined" && "download" in document.createElement("a")) {
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { method: "download" };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return { method: "preview", url: URL.createObjectURL(blob), name };
}

export function revokePreviewUrl(url) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
