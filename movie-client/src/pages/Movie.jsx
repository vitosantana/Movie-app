import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovie, getMovieVideos, getRecommendations, getMovieSimilar, discoverMovieByGenre, getMovieImages } from "../api";
import SectionRow from "../components/SectionRow";
import "../index.css";

export default function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [recs, setRecs] = useState([]);
   const [fallback, setFallback] = useState([]);
   const [logos, setLogos] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
     setMovie(null);
    setVideos([]);
    setRecs([]);
    setFallback([]);
    setErr("");

    
    async function load() {
      try {
        // 1) main movie + videos + recommendations
        const [m, v, r, i] = await Promise.all([
          getMovie(id),
          getMovieVideos(id),
          getRecommendations(id),
            getMovieImages(id),
        ]);
         if (!alive) return;

        setMovie(m);
        setVideos(v?.results || []);
        setLogos(i?.logos || []);

        const primaryRecs = (r?.results || []).filter(
          (x) => x.backdrop_path && x.id !== m.id
        );

        if (primaryRecs.length) {
          setRecs(primaryRecs);
          return;
        }

        // 2) fallback: similar movies
        let similar = [];
        try {
          const simRes = await getMovieSimilar(id);
          similar = (simRes?.results || []).filter(
            (x) => x.backdrop_path && x.id !== m.id
          );
        } catch {
          // ignore; we'll try genre next
        }

        if (!alive) return;

        if (similar.length) {
          setFallback(similar);
          return;
        }

        // 3) fallback: discover by first genre
        const firstGenreId = m?.genres?.[0]?.id;
        if (!firstGenreId) return;

        try {
          const discRes = await discoverMovieByGenre(firstGenreId, 1); // Call TMDB discover endpoint by genre
          const genreItems = (discRes?.results || []).filter( //Filter results so they only show movies with a poster
            (x) => x.backdrop_path && x.id !== m.id
          );
          if (!alive) return;
          setFallback(genreItems);
        } catch {
          // If discover by genre fails, we don't display a rec
        }
      } catch (e) {
        if (!alive) return;
        setErr(e.message);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);
    

  const trailer = useMemo(
    () => videos.find(x => x.type === "Trailer" && x.site === "YouTube"),
    [videos]
  );

  const logo = useMemo(
  () => logos.find(l => l.iso_639_1 === "en") || logos[0],
  [logos]
);

  if (err)  return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!movie) return <div style={{ padding: 16, color: "#fff" }}>Loading…</div>;

  const bg = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : undefined;
    // Ensures the recommended section always displays something
     const recItems = recs.length ? recs : fallback;
     
     // If using fallback recs, shuffle them for better variety
let finalRecs = recItems;
if (!recs.length && fallback.length) {
  finalRecs = [...fallback].sort(() => Math.random() - 0.5);
}

  return (
     <div className="app">
    {/* Hero banner */}
    <div style={{
      borderRadius: 14,
      overflow: "hidden",
      background: bg ? `center/cover url(${bg})` : "#1b1329",
      minHeight: "100vh",
      display: "grid",
      alignItems: "end"
    }}>
      <div style={{
        backdropFilter: "blur(2px)",
        background: "linear-gradient(180deg,rgba(0,0,0,0) 0, rgba(0,0,0,.65) 60%)",
        padding: 24
      }}>
        {logo ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${logo.file_path}`}
            alt={movie.title}
            style={{
              width: "40vw",
              maxWidth: "500px",
              marginBottom: 12,
              display: "block",
            }}
          />
        ) : (
          <h1 style={{ margin: 0 }}>{movie.title}</h1>
        )}

        <div style={{ opacity: .85, marginTop: 6 }}>
          {movie.release_date?.slice(0,4)} • {movie.runtime}m • {movie.vote_average?.toFixed(1)}★
        </div>
        <p style={{ maxWidth: 800 }}>{movie.overview}</p>
        {trailer && (
          <a
            href={`https://www.youtube.com/watch?v=${trailer.key}`}
            target="_blank" 
            rel="noreferrer"
            className="trailer-link"
          >
            ▶ Watch trailer
          </a>
        )}
      </div>
    </div>

    {/* Recommendations */}
    {finalRecs.length > 0 && (
      <SectionRow
        title="Recommended for you"
        items={finalRecs}
        getHref={(m) => `/movie/${m.id}`}
      />
    )}
  </div>
);
}


