//Search Bar that calls the API

import { useState } from "react";
import { searchMovies } from "../api";
import { Link } from "react-router-dom";

export default function Search() {
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSearch() {
    if (!q.trim()) return;
    setLoading(true);
    try { setData(await searchMovies(q)); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies…"
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <button onClick={onSearch} disabled={loading || !q.trim()}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", marginTop: 16 }}>
        {data?.results?.map((m) => (
          <Link key={m.id} to={`/movie/${m.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            {m.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                alt={m.title}
                loading="lazy"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
            <div style={{ marginTop: 8, fontWeight: 600 }}>{m.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
