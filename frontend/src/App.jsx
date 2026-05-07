import React, { useEffect, useState } from "react";
import HeatmapPage from "./pages/HeatmapPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import SocialGraphPage from "./pages/SocialGraphPage.jsx";

const API_URL = "http://localhost:4000/upload";
const IG_PROFILE_BASE_URL = "https://www.instagram.com/";

function NonFollowersPage() {
  const [followersFile, setFollowersFile] = useState(null);
  const [followingFile, setFollowingFile] = useState(null);
  const [nonFollowers, setNonFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNonFollowers([]);

    if (!followersFile || !followingFile) {
      setError("Please upload both Followers and Following JSON files.");
      return;
    }

    const formData = new FormData();
    formData.append("followersFile", followersFile);
    formData.append("followingFile", followingFile);

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to process files.");
      }

      setNonFollowers(Array.isArray(data.non_followers) ? data.non_followers : []);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1>ig-wrapped</h1>
      <p>Upload your two Instagram export JSON files to compare accounts.</p>

      <form onSubmit={handleSubmit} className="card">
        <label>
          Followers JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => setFollowersFile(e.target.files?.[0] || null)}
          />
        </label>

        <label>
          Following JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => setFollowingFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Find Non-Followers"}
        </button>
      </form>

      {error ? <div className="error">{error}</div> : null}

      <section className="card">
        <h2>Results ({nonFollowers.length})</h2>
        {nonFollowers.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          <ul className="results">
            {nonFollowers.map((username) => {
              const profileUrl = `${IG_PROFILE_BASE_URL}${encodeURIComponent(username)}/`;

              return (
                <li key={username}>
                  <span>{username}</span>
                  <a href={profileUrl} target="_blank" rel="noreferrer">
                    {profileUrl}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }
  if (pathname.startsWith("/heatmap")) {
    return "/heatmap";
  }
  if (pathname.startsWith("/social-graph")) {
    return "/social-graph";
  }
  if (pathname.startsWith("/messages")) {
    return "/messages";
  }
  return "/";
}

export default function App() {
  const [route, setRoute] = useState(normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigateTo(path) {
    if (window.location.pathname === path) {
      return;
    }
    window.history.pushState({}, "", path);
    setRoute(path);
  }

  return (
    <main className="app-shell">
      <header className="top-nav">
        <div className="top-nav__inner">
          <h1 className="top-nav__title">ig-wrapped</h1>
          <nav className="top-nav__links" aria-label="Primary">
            <button
              type="button"
              className={route === "/" ? "nav-link is-active" : "nav-link"}
              onClick={() => navigateTo("/")}
            >
              Non-Followers
            </button>
            <button
              type="button"
              className={route === "/heatmap" ? "nav-link is-active" : "nav-link"}
              onClick={() => navigateTo("/heatmap")}
            >
              Activity Heatmap
            </button>
            <button
              type="button"
              className={route === "/social-graph" ? "nav-link is-active" : "nav-link"}
              onClick={() => navigateTo("/social-graph")}
            >
              Social Graph
            </button>
            <button
              type="button"
              className={route === "/messages" ? "nav-link is-active" : "nav-link"}
              onClick={() => navigateTo("/messages")}
            >
              Messages
            </button>
          </nav>
        </div>
      </header>

      {route === "/heatmap" ? (
        <HeatmapPage />
      ) : route === "/social-graph" ? (
        <SocialGraphPage />
      ) : route === "/messages" ? (
        <MessagesPage />
      ) : (
        <NonFollowersPage />
      )}
    </main>
  );
}
