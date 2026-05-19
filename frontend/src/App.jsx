import React, { useEffect, useState } from "react";
import { ExportDataProvider, useExportData } from "./context/ExportDataContext.jsx";
import { resolveRoute } from "./config/features.js";
import GuidePage from "./pages/GuidePage.jsx";
import WrappedPage from "./pages/WrappedPage.jsx";

function AppInner() {
  const { files, clearFiles } = useExportData();
  const [route, setRoute] = useState(() => resolveRoute(window.location.pathname));

  useEffect(() => {
    const syncRoute = () => {
      const target = resolveRoute(window.location.pathname);
      if (window.location.pathname !== target) {
        window.history.replaceState({}, "", target);
      }
      setRoute(target);
    };

    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function navigateTo(path) {
    const target = resolveRoute(path);
    if (window.location.pathname !== target) {
      window.history.pushState({}, "", target);
    }
    setRoute(target);
  }

  return (
    <main className="app-shell">
      <header className="top-nav">
        <div className="top-nav__inner">
          <h1 className="top-nav__title">ig-wrapped</h1>
          <nav className="top-nav__links" aria-label="Primary">
            <button
              type="button"
              className={route === "/wrapped" ? "nav-link is-active" : "nav-link"}
              onClick={() => navigateTo("/wrapped")}
            >
              Wrapped
            </button>
            <button
              type="button"
              className={route === "/guide" ? "nav-link is-active" : "nav-link"}
              onClick={() => navigateTo("/guide")}
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

      {route === "/guide" ? <GuidePage /> : <WrappedPage />}
    </main>
  );
}

export default function App() {
  return (
    <ExportDataProvider>
      <AppInner />
    </ExportDataProvider>
  );
}
