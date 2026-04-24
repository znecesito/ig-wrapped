import React, { useState } from "react";

const API_URL = "http://localhost:4000/upload";
const IG_PROFILE_BASE_URL = "https://www.instagram.com/";

export default function App() {
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
    <main className="container">
      <h1>Instagram Non-Followers Checker</h1>
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
    </main>
  );
}
