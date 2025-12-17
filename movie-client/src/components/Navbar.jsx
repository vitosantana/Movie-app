import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchAll} from "../api"
import { AuthContext } from "../context/AuthContext";
import "./navbar.css";


function getHrefForItem(item) {
  const type =
    item.media_type ||
    (item.first_air_date ? "tv" : "movie"); // fallback if media_type missing

  if (type === "tv") return `/tv/${item.id}`;
  return `/movie/${item.id}`;
}


export default function Navbar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // array of movie objects
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // whether dropdown is visible
  const [selected, setSelected] = useState(-1); // keyboard index
  const { user, logout } = useContext(AuthContext);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const controllerRef = useRef(null);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false); // Makes Navbar transparent by default

    
  function handleLogout() {
    logout();
    navigate("/");
  }

    useEffect(() => {
  function onScroll() {
    // turns solid when scrollY > 10
    setIsScrolled(window.scrollY > 10);
  }

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);
  

  // debounce + fetch suggestions
  useEffect(() => {
    // clear previous debounce timer
    clearTimeout(timeoutRef.current);

    // if empty query, clear suggestions and return
    const q = (query || "").trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // set debounce
    timeoutRef.current = setTimeout(() => {
      // cancel previous fetch if running
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      setSelected(-1);

      // call API on first page
      searchAll(q, 1)
        .then((res) => {
          const items = (res?.results || [])
          .filter(m => m.poster_path) // only keep results with a movie poster
          .slice(0, 5); // top 5
          setSuggestions(items);
          setOpen(items.length > 0);
        })
        .catch((err) => {
          if (err.name === "AbortError") return; // expected when canceled
          console.error("Autocomplete error:", err);
          setSuggestions([]);
          setOpen(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutRef.current);
      
    };
  }, [query]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
        setSelected(-1);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function onSubmit(e) {/* Function that handles form submission */
    e.preventDefault(); // Prevents the page from reloading
    const q = query.trim(); // removes extra spaces
    if (!q) return; // Prevents navigation with no value in the search imput
    // navigate to a Search route -- implement Search page to read ?q=
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery(""); //Clears the search input after submitting
  }
    // Called when the user clicks a suggestion in the autocomplete search dropdown
   function openMovie(item) {
  setOpen(false);
  setSuggestions([]);
  setQuery("");

  const href = getHrefForItem(item);
  navigate(href);
}

    // Makes the dropdown keyboard navigable
   function onKeyDown(e) {
    if (!open) return; //Ignore keyboard if dropdown is closed
    if (e.key === "ArrowDown") {
      e.preventDefault(); //stops the cursor from moving to the end of the input automatically.
      setSelected((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selected >= 0 && suggestions[selected]) {
        openMovie(suggestions[selected]);
      } else {
        // no selection, go to search results
        const q = (query || "").trim();
        if (q) {
          setOpen(false);
          navigate(`/search?q=${encodeURIComponent(q)}`);
          setQuery("");
        }
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setSelected(-1);
    }
  }

  return (
    <header className={`nav-root ${isScrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner" ref={containerRef}>
        {/* Left: logo + main links */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
          <img src="/Ice.png" alt="MovieApp Logo" className="nav-logo-img" />
          <span className="nav-logo-text">Chrystal Clear</span>
          </Link>


          <nav className="nav-links">
            <Link to="/movies" className="nav-link">Movies</Link>
            <Link to="/tv" className="nav-link">TV Shows</Link>
            {user && (
              <Link to="/my-list" className="nav-link">
                My List
              </Link>
              )}
          </nav>
        </div>

        {/* Right: search + actions */}
        <div className="nav-right">
          <form onSubmit={onSubmit} className="nav-search-form" role="search" autoComplete="off">
            <input
              className="nav-search-input"
              placeholder="Find movies, TV shows and more"
              value={query}
               onChange={(e) => { setQuery(e.target.value); }}
               onKeyDown={onKeyDown}
              aria-label="Search movies and TV shows"
            />
            
            {/* Search */}
          <button className="nav-search-btn" type="submit" aria-label="Search">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    width="18"
    height="18"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
</button>

              

            {/* suggestions dropdown */}
            {open && (
              <ul className="suggestions" role="listbox" aria-activedescendant={selected >= 0 ? `sugg-${selected}` : undefined}>
                {loading && <li className="suggestion suggestion-loading">Loading…</li>}
                {!loading && suggestions.map((m, i) => (
                  <li
                    key={m.id}
                    id={`sugg-${i}`}
                    role="option"
                    aria-selected={selected === i}
                    className={`suggestion ${selected === i ? "selected" : ""}`}
                    onMouseDown={(ev) => {
                      // mouseDown (not click) so input doesn't lose focus before navigate
                      ev.preventDefault();
                      openMovie(m);
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <img
                      src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "/placeholder-92.png"}
                      alt=""
                      className="sugg-thumb"
                      aria-hidden="true"
                    />
                    <div className="sugg-meta">
                      <div className="sugg-title">{m.title || m.name}</div>
                      <div className="sugg-sub">{(m.release_date || m.first_air_date || "").slice(0, 4)} {" · "} {m.media_type === "tv" ? "TV" : "Movie"}</div>
                    </div>
                  </li>
                ))}
                {!loading && suggestions.length === 0 && <li className="suggestion">No results</li>}
              </ul>
            )}
          </form>

         <div className="nav-actions">
            {user ? (
              <>
                <Link to="/profile" className="nav-user">
                 {user.email}
                </Link>
                <button className="nav-action nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="nav-action">Register</Link>
                <Link to="/login" className="nav-action">Sign In</Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

