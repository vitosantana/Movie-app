import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTrendingTV, discoverTVByGenre } from "../api";
import { getHrefForItem } from "../utils/getHrefForItem";
import "../index.css";
import "./TvCategory.css";

const TV_GENRE_CONFIG = {
  action: {
    id: 10759,
    label: "Action & Adventure",
    desc: "Explosive blockbusters packed with stunts, speed, and adrenaline.",
  },

  comedy: {
    id: 35,
    label: "Comedy",
    desc: "Feel-good shows guaranteed to make you laugh out loud.",
  },

  drama: {
    id: 18,
    label: "Drama Series",
    desc: "Emotional, gripping stories with unforgettable performances.",
  },

  scifi: {
    id: 10765,
    label: "Sci-Fi & Fantasy",
    desc: `Mind-bending adventures, futuristic worlds, and stories that stretch the imagination.`,
  },
};



export default function TVCategory() {
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
        // Recommended TV
        if (slug === "recommended-tv") {
          setTitle("Recommended TV");
           setDescription("Browse more recommended TV shows.");
          const res = await getTrendingTV();
          if (!alive) return;
          setItems(res.results || []);
          setLoading(false);
          return;
        }

          //Binge Tonight TV
      if (slug === "binge-tonight") {
        setTitle("Binge Tonight");
        setDescription("Relax and unwind tonight with the most entertaining tv shows.");
        const res = await getTrendingTV();
        if (!alive) return;
        setItems(res.results || []);
        setLoading(false);
        return;
      }

        // Genre-based TV
        const config = TV_GENRE_CONFIG[slug];
        if (!config) {
          setErr("Unknown category");
          setLoading(false);
          return;
        }

        setTitle(config.label);
        setDescription(
          config.desc || `Browse more ${config.label.toLowerCase()} shows.`
        );
        const res = await discoverTVByGenre(config.id, 1);
        if (!alive) return;
        setItems(res.results || []);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [slug]);

  if (err) return <div className="tv-category-page" style={{ padding: 24, color: "crimson" }}>Error: {err}</div>;
  if (loading) return <div className="tv-category-page" style={{ padding: 24, color: "#fff" }}>Loading…</div>;

  return (<div className="tv-category-page app">
      {/* big header */}
      <div className="tv-category-header">
        <h1>{title}</h1>
        <p className="tv-category-description">
          {description}
        </p>
        <hr />
      </div>

      {/* grid of posters */}
      <div className="tv-category-grid">
        {items.map((m) => (
          <Link
            key={m.id}
            to={getHrefForItem(m)}
            className="tv-category-card"
          >
            <img
              className="tv-category-poster" 
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              alt={m.name || m.title || "TV show"}
            />
            <div className="tv-category-title">
              {m.name|| m.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
    
}
