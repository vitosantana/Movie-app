import { useRef, useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getHrefForItem } from "../Utils/getHrefForItem";
import { AuthContext } from "../context/AuthContext";
import { addToWatchlist, removeFromWatchlist } from "../api";

export default function SectionRow({
  title,
  items = [],
  getHref = getHrefForItem,
  sectionHref,
}) {
  //Values from the global AuthContext
  const { user, watchlist, setWatchlist } = useContext(AuthContext);
  const ref = useRef(null); //Reference to the scroll container/ Used to Calculate arrow visibility
  const [atStart, setAtStart] = useState(true); //Displays / Hides left arrow
  const [atEnd, setAtEnd] = useState(true); //Displays / Hides right arrow
  const [pendingId, setPendingId] = useState(null); // Id of the movie being updated or clicked

  // This function checks to see if an item is already in My List
  function isInWatchlist(item) {
    const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");

    return watchlist?.some(
      (w) =>
        w.id === item.id && //Checks to see if item shares same id
        (w.media_type || (w.first_air_date ? "tv" : "movie")) === mediaType //Checks to see if item shares same mediatype
    );
  }

  // Normalize shape for backend / local state. Organizes Api
  function normalize(item) {
    return {
      id: item.id,
      media_type: item.media_type || (item.first_air_date ? "tv" : "movie"),
      title: item.title || item.name || "",
      poster_path: item.poster_path || null,
    };
  }

  // Add / remove from My List 
  async function handleToggleFromRow(e, item) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("You need to sign in to use My List");
      return;
    }

    const normalized = normalize(item);
    const already = isInWatchlist(normalized);

    try {
      setPendingId(item.id);

      if (already) {
        // REMOVE from backend
        await removeFromWatchlist(normalized.id);

        // REMOVE from global state
        setWatchlist((prev) =>
          prev.filter(
            (w) =>
              !(
                w.id === normalized.id &&
                (w.media_type || (w.first_air_date ? "tv" : "movie")) ===
                  normalized.media_type
              )
          )
        );
      } else {
        // ADD to backend
        const res = await addToWatchlist(normalized);

        // Checks to see if backend returned a full watchlist
        if (res && Array.isArray(res.items)) {
          setWatchlist(res.items);
        } else {
          // Otherwise just append client-side to prevent duplicates
          setWatchlist((prev) =>
            prev.some((w) => w.id === normalized.id) ? prev : [...prev, normalized] // Is this item already in the watchlist?
          );
        }
      }
    } catch (err) {
      console.error("Row toggle watchlist error:", err);
      alert("Failed to update My List");
    } finally {
      setPendingId(null);
    }
  }

  const scrollByCards = (dir) => {
    const el = ref.current;
    if (!el) return;

    el.scrollBy({
      left: dir * el.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  // detect if we can scroll + whether we're at the start/end
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (maxScroll <= 0) {
        setAtStart(true);
        setAtEnd(true);
        return;
      }

      setAtStart(el.scrollLeft <= 0);
      setAtEnd(el.scrollLeft >= maxScroll - 1);
    };

    el.scrollLeft = 0;
    update();

    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <>
      <div className="section">
        <div className="section-title">
          {sectionHref ? (
            <Link to={sectionHref} className="section-link">
              <span>{title}</span>
              <span className="chev">›</span>
            </Link>
          ) : (
            <>
              <span>{title}</span>
              <span className="chev">›</span>
            </>
          )}
        </div>
      </div>

      <div className="row">
        {/* left arrow */}
        {!atStart && (
          <button className="arrow left" onClick={() => scrollByCards(-1)}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        )}

        <div className="scroller" ref={ref}>
          {items
            .filter((m) => !!m.poster_path)
            .map((m) => {
              const inList = isInWatchlist(m);
              const isPending = pendingId === m.id;

              return (
                <Link key={m.id} to={getHref(m)} className="card">
                  <div className="card-inner">
                    <img
                      className="thumb"
                      src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                      alt={m.title || m.name}
                      loading="lazy"
                    />

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

                      <button
                        type="button"
                        className="card-hover-button"
                        onClick={(e) => handleToggleFromRow(e, m)}
                      >
                        {isPending
                          ? inList
                            ? "Removing…"
                            : "Adding…"
                          : inList
                          ? "Remove from My List"
                          : "Add to My List"}
                      </button>
                    </div>
                  </div>

                  <div className="caption">{m.title || m.name}</div>
                </Link>
              );
            })}
        </div>

        {/* right arrow */}
        {!atEnd && (
          <button className="arrow right" onClick={() => scrollByCards(1)}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
