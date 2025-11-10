// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function onSubmit(e) {/* Function that handles form submission */
    e.preventDefault(); // Prevents the page from reloading
    const q = query.trim(); // removes extra spaces
    if (!q) return; // Prevents navigation with no value in the search imput
    // navigate to a Search route -- implement Search page to read ?q=
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery(""); //Clears the search input after submitting
  }

  return (
    <header className="nav-root">
      <div className="nav-inner">
        {/* LEFT: logo + main links */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">🎬 MovieApp</Link>

          <nav className="nav-links">
            <Link to="/movies" className="nav-link">Movies</Link>
            <Link to="/tv" className="nav-link">TV Shows</Link>
          </nav>
        </div>

        {/* RIGHT: search + actions */}
        <div className="nav-right">
          <form onSubmit={onSubmit} className="nav-search-form" role="search">
            <input
              className="nav-search-input"
              placeholder="Find movies, TV shows and more"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search movies and TV shows"
            />
            <button className="nav-search-btn" type="submit" aria-label="Search">
              🔍
            </button>
          </form>

          {/* optional auth / register links — keep if you want */}
          <div className="nav-actions">
            <Link to="/register" className="nav-action">Register</Link>
            <Link to="/signin" className="nav-action">Sign In</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
