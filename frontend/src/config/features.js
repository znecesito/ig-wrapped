/** Reachable UI routes (pathname). `/guide` redirects to `/#how-to` in App. */
export const PUBLIC_ROUTES = ["/", "/wrapped", "/guide"];

export const LANDING_HASH_HOW_TO = "#how-to";

/**
 * @param {string} [pathname]
 * @returns {"/" | "/wrapped"}
 */
export function resolveRoute(pathname) {
  const path = pathname || "/";
  if (path === "/" || path === "") {
    return "/";
  }
  if (path.startsWith("/wrapped")) {
    return "/wrapped";
  }
  // `/guide` and legacy paths → landing (guide URL normalized to /#how-to in App)
  return "/";
}

/**
 * Canonical pathname + hash for the client router.
 * @param {string} pathname
 * @param {string} hash
 * @returns {{ pathname: "/" | "/wrapped", hash: string, shouldReplace: boolean }}
 */
export function normalizeAppLocation(pathname, hash = "") {
  if (pathname.startsWith("/guide")) {
    return { pathname: "/", hash: LANDING_HASH_HOW_TO, shouldReplace: true };
  }

  const route = resolveRoute(pathname);
  const shouldReplace = pathname !== route;
  return { pathname: route, hash, shouldReplace };
}

/**
 * @param {string} sectionId
 * @param {{ behavior?: ScrollBehavior }} [options]
 */
export function scrollToLandingSection(sectionId, { behavior = "smooth" } = {}) {
  const el = document.getElementById(sectionId);
  if (!el) {
    return;
  }

  const nav = document.querySelector(".top-nav");
  const gap = 12;
  const offset = (nav?.offsetHeight ?? 72) + gap;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior });
}
