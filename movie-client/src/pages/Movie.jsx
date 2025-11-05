//Details Page

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovie } from "../api";

export default function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    setMovie(null);
    getMovie(id).then(setMovie).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!movie) return <div style={{ padding: 16 }}>Loading…</div>;

  const bg = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;

  return (
    <div>
      {bg && (
        <div
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: 320
          }}
        />
      )}
      <div style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 8 }}>{movie.title}</h1>
        <p style={{ opacity: 0.8, maxWidth: 900 }}>{movie.overview}</p>
        <div style={{ marginTop: 8 }}>
          {movie.release_date && <span>Release: {movie.release_date} • </span>}
          {movie.runtime ? <span>Runtime: {movie.runtime} min</span> : null}
        </div>
        {movie.credits?.cast?.length ? (
          <div style={{ marginTop: 16 }}>
            <strong>Top Cast:</strong>
            <ul style={{ columns: 2, marginTop: 8 }}>
              {movie.credits.cast.slice(0, 10).map((c) => (
                <li key={c.cast_id || c.credit_id}>{c.name} {c.character ? `as ${c.character}` : ""}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
