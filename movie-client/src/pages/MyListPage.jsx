import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getWatchlist } from "../api";
import "../index.css";
import "./MyListPage.css"; 
import { getHrefForItem } from "../utils/getHrefForItem";
import { removeFromWatchlist } from "../api";


export default function MyListPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  async function handleRemove(item) {
    try {
      await removeFromWatchlist(item.id);

      // Remove from UI instantly (no reload needed)
      setItems((prev) =>
       prev.filter((x) => x.id !== item.id));
    } catch (e) {
      console.error("Failed to remove:", e);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let alive = true;

    async function load() {
  try {
    setLoading(true);
    setErr("");

    const data = await getWatchlist();

    if (!alive) return;

    const arr = Array.isArray(data) ? data : data?.items || [];
    setItems(arr);
  } catch (e) {
    if (!alive) return;
    console.error(e);
    setErr(e.message || "Failed to load watchlist");
  } finally {
    if (alive) setLoading(false);
  }
}


    load();
    return () => {
      alive = false;
    };
  }, [user, navigate]);

  if (!user) return null;

  return (
   <div className="app mylist-page">
      {/* Header area */}
      <header className="mylist-header">
        <h1 className="mylist-title">My List</h1>
        <p className="mylist-subtitle">Your personal list</p>

        {loading && <p className="mylist-status">Loading…</p>}

        {err && (
          <p className="mylist-status mylist-error">
            Error: {err}
          </p>
        )}

        {!loading && !err && items.length === 0 && (
          <p className="mylist-status mylist-empty">
            Your list is empty. Browse movies and TV shows and click{" "}
            <strong>+ My List</strong> to add them here.
          </p>
        )}

        <div className="mylist-divider" />
      </header>

      {/* Grid of posters */}
      {!loading && !err && items.length > 0 && (
          <main className="mylist-grid">
        {items.map((m) => (
    <Link
      key={`${m.media_type || "movie"}-${m.id}`}
      to={getHrefForItem(m)}
      className="card mylist-card"
    >
      <div className="card-inner">
        <img
          className="thumb"
          src={
            m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "/placeholder-500.png"
          }
          alt={m.title || m.name}
          loading="lazy"
        />

        {/* Same overlay as Movies page */}
        <div className="card-hover-overlay">
          <div className="overlay-spacer-top"></div>

          <div className="card-hover-play">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <div className="overlay-spacer-bottom"></div>

          {/* Remove button only visible on hover (overlay) */}
          <button
            type="button"
            className="watchlist-btn"
            onClick={(e) => {
              e.preventDefault();    // Stops the browser from navigating
              e.stopPropagation();   // This click belongs only to this button
              handleRemove(m);
            }}
          >
            Remove from My List
          </button>
        </div>
      </div>

      {/* Caption centered under the card */}
      <div className="caption">{m.title || m.name}</div>
    </Link>
  ))}
</main>
)}
</div>
);
}
