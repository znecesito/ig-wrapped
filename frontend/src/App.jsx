import React, { useCallback, useEffect, useState } from "react";
import { ExportDataProvider, useExportData } from "./context/ExportDataContext.jsx";
import { WrappedPlayerProvider, useWrappedPlayer } from "./context/WrappedPlayerContext.jsx";
import {
  LANDING_HASH_HOW_TO,
  normalizeAppLocation,
  resolveRoute,
  scrollToLandingSection
} from "./config/features.js";
import LandingPage from "./pages/LandingPage.jsx";
import WrappedPage from "./pages/WrappedPage.jsx";

function applyNormalizedLocation({ pathname, hash }) {
  const url = `${pathname}${hash}`;
  if (`${window.location.pathname}${window.location.hash}` !== url) {
    window.history.replaceState({}, "", url);
  }
}

function readLocationFromWindow() {
  const { pathname, hash, shouldReplace } = normalizeAppLocation(
    window.location.pathname,
    window.location.hash
  );
  if (shouldReplace) {
    applyNormalizedLocation({ pathname, hash });
  }
  return { route: resolveRoute(pathname), hash };
}

function AppInner() {
  const { files, clearFiles } = useExportData();
  const { isPlayerActive } = useWrappedPlayer();
  const [location, setLocation] = useState(readLocationFromWindow);
  const { route, hash: locationHash } = location;

  useEffect(() => {
    const syncRoute = () => {
      setLocation(readLocationFromWindow());
    };

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const navigateTo = useCallback((path) => {
    if (path === "/guide" || path === LANDING_HASH_HOW_TO || path === `/${LANDING_HASH_HOW_TO}`) {
      window.history.pushState({}, "", `/${LANDING_HASH_HOW_TO}`);
      setLocation({ route: "/", hash: LANDING_HASH_HOW_TO });
      requestAnimationFrame(() => scrollToLandingSection("how-to", { behavior: "smooth" }));
      return;
    }

    const target = resolveRoute(path);
    window.history.pushState({}, "", target);
    setLocation({ route: target, hash: "" });
  }, []);

  const showNav = !isPlayerActive;
  const onLanding = route === "/";

  return (
    <main className="app-shell">
      {showNav ? (
        <header className="top-nav">
          <div className="top-nav__inner">
            <h1 className="top-nav__title font-bold text-nav-link-text">ig-wrapped</h1>
            <nav className="top-nav__links" aria-label="Primary">
              {!onLanding ? (
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => navigateTo("/")}
                >
                  Home
                </button>
              ) : null}
              <button
                type="button"
                className={route === "/wrapped" ? "nav-link is-active" : "nav-link"}
                onClick={() => navigateTo("/wrapped")}
              >
                Wrapped
              </button>
              <button
                type="button"
                className={
                  onLanding && locationHash === LANDING_HASH_HOW_TO
                    ? "nav-link is-active"
                    : "nav-link"
                }
                onClick={() => navigateTo(LANDING_HASH_HOW_TO)}
              >
                How to export
              </button>
              {files ? (
                <>
                  <span className="nav-data-indicator">
                    <span className="nav-data-indicator__dot" aria-hidden />
                    Data loaded
                  </span>
                  <button type="button" className="nav-clear-btn" onClick={clearFiles}>
                    Clear
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        </header>
      ) : null}

      {route === "/" ? <LandingPage /> : <WrappedPage />}
    </main>
  );
}

export default function App() {
  return (
    <ExportDataProvider>
      <WrappedPlayerProvider>
        <AppInner />
      </WrappedPlayerProvider>
    </ExportDataProvider>
  );
}
