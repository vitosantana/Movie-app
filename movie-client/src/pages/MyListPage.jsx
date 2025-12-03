import { useEffect, useState } from "react";
import { getWatchlist, removeFromWatchlist } from "../api";

export default function MyListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await getWatchlist();
        setItems(data.items || []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRemove(id) {
    try {
      const data = await removeFromWatchlist(id);
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
      alert("Failed to remove from list");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "900px" }}>
        <h1>My List</h1>
        {loading && <p>Loading…</p>}
        {err && <p className="auth-error">{err}</p>}
        {!loading && !items.length && <p>You don't have anything in your list yet.</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                  alt={item.title}
                  style={{ width: "100%", display: "block" }}
                />
              ) : (
                <div style={{ padding: "40px 8px", fontSize: "0.9rem" }}>No image</div>
              )}
              <div style={{ padding: "8px" }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    minHeight: "2.4em",
                  }}
                >
                  {item.title}
                </div>
                <button
                  className="auth-btn"
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{ width: "100%", padding: "6px 8px", fontSize: "0.8rem" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
