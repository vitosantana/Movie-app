//Details Page
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovie, getMovieVideos, getRecommendations } from "../api";
import SectionRow from "../components/SectionRow";
import "../index.css";

export default function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [recs, setRecs] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([getMovie(id), getMovieVideos(id), getRecommendations(id)])
      .then(([m, v, r]) => {
        if (!alive) return;
        setMovie(m);
        setVideos(v?.results || []);
        setRecs(r?.results || []);
      })
      .catch(e => setErr(e.message));
    return () => { alive = false; };
  }, [id]);

  const trailer = useMemo(
    () => videos.find(x => x.type === "Trailer" && x.site === "YouTube"),
    [videos]
  );

  if (err)  return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!movie) return <div style={{ padding: 16, color: "#fff" }}>Loading…</div>;

  const bg = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : undefined;

  return (
    <div className="app">
      {/* Hero banner */}
      <div style={{
        borderRadius: 14,
        overflow: "hidden",
        background: bg ? `center/cover url(${bg})` : "#1b1329",
        minHeight: 360,
        display: "grid",
        alignItems: "end"
      }}>
        <div style={{
          backdropFilter: "blur(2px)",
          background: "linear-gradient(180deg,rgba(0,0,0,0) 0, rgba(0,0,0,.65) 60%)",
          padding: 24
        }}>
          <h1 style={{ margin: 0 }}>{movie.title}</h1>
          <div style={{ opacity: .85, marginTop: 6 }}>
            {movie.release_date?.slice(0,4)} • {movie.runtime}m • {movie.vote_average?.toFixed(1)}★
          </div>
          <p style={{ maxWidth: 800 }}>{movie.overview}</p>
          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank" rel="noreferrer"
              style={{ color: "white", fontWeight: 700 }}
            >
              ▶ Watch trailer
            </a>
          )}
        </div>
      </div>

      {/* Recommendations */}
        {recs.filter(m => m.backdrop_path).length > 0 && (
          <SectionRow
          title="Recommended for you"
          items={recs.filter(m => m.backdrop_path)}
          />
)}
      </div>
  );
}
