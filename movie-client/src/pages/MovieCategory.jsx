import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTrending, discoverMovieByGenre } from "../api";
import "../index.css";
import "./MovieCategory.css";  

const GENRE_CONFIG = {
  action: {
    id: 28,
    label: "Action Hits",
    desc: "Explosive blockbusters packed with stunts, speed, and adrenaline.",
  },
  comedy: {
    id: 35,
    label: "Laugh Out Loud",
    desc: "Feel-good films guaranteed to make you laugh out loud.",
  },
  horror: {
    id: 27,
    label: "Horror Nights",
    desc: "Terrifying movies that will haunt you long after the credits roll.",
  },
  drama: {
    id: 18,
    label: "Drama Spotlight",
    desc: "Emotional, gripping stories with unforgettable performances.",
  },
};


export default function MovieCategory() {
  const { slug } = useParams();           
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");


  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        if (slug === "recommended") {
          setTitle("Recommended");
           setDescription("We picked these just for you.");
          const res = await getTrending();
          if (!alive) return;
          setItems(res.results || []);
          setLoading(false);
          return;
        }

        //Movie Night custom slug
        if (slug === "movie-night") {
          setTitle("Movie Night");
           setDescription("Relax and unwind tonight with the most entertaining tv movies.");
          const res = await getTrending();
          if (!alive) return;
          setItems(res.results || []);
          setLoading(false);
          return;
        }

        // 🔹 Genre based
        const config = GENRE_CONFIG[slug];
        if (!config) {
          setErr("Unknown category");
          setLoading(false);
          return;
        }

        setTitle(config.label);
          setDescription(
          config.desc || `Browse more ${config.label.toLowerCase()} movies.`
        )
        const res = await discoverMovieByGenre(config.id, 1);
        if (!alive) return;
        setItems(res.results || []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [slug]);

  if (err)      return <div style={{ padding: 24, color: "crimson" }}>Error: {err}</div>;
  if (loading)  return <div style={{ padding: 24, color: "#fff" }}>Loading…</div>;

  return (
    <div className="movie-category-page app">
      {/* big header */}
      <div className="movie-category-header">
        <h1>{title}</h1>
        <p className="tv-category-description">
          {description}
        </p>
        <hr />
      </div>

      {/* grid of posters */}
      <div className="movie-category-grid">
        {items.map((m) => (
          <Link
            key={m.id}
            to={`/movie/${m.id}`}
            className="movie-category-card"
          >
            <img
              className="movie-category-poster" 
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              alt={m.title}
            />
            <div className="movie-category-title">
              {m.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
