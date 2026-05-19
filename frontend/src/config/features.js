/** Only Wrapped + export guide are reachable in the UI. */
export const PUBLIC_ROUTES = ["/wrapped", "/guide"];

/**
 * @param {string} [pathname]
 * @returns {"/wrapped" | "/guide"}
 */
export function resolveRoute(pathname) {
  const path = pathname || "/";
  if (path.startsWith("/guide")) {
    return "/guide";
  }
  return "/wrapped";
}
