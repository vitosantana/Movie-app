import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTVShow,
  getTVVideos,
  getTVRecommendations,
  getTVSimilar,
  discoverTVByGenre,
  getTVImages,
} from "../api";
import SectionRow from "../components/SectionRow";
import "../index.css";

export default function TVDetails() {
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [videos, setVideos] = useState([]);
   const [logos, setLogos] = useState([]);
  const [recs, setRecs] = useState([]);       // TMDB recommendations
  const [fallback, setFallback] = useState([]); // similar/genre
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    // reset between ID changes
    setShow(null);
    setVideos([]);
    setLogos([]);
    setRecs([]);
    setFallback([]);
    setErr("");

    async function load() {
      try {
        // basic info, videos, recommendations
        const [s, v, r,i] = await Promise.all([
          getTVShow(id),
          getTVVideos(id),
          getTVRecommendations(id),
           getTVImages(id),
        ]);

        if (!alive) return;

        setShow(s);
        setVideos(v?.results || []);
        setLogos(i?.logos || []);

        const primaryRecs = (r?.results || []).filter(
          (m) => m.backdrop_path
        );

        if (primaryRecs.length) {
          setRecs(primaryRecs);
          return; 
        }

        // Fallback: similar shows
        let similar = [];
        try {
          const simRes = await getTVSimilar(id);
          similar = (simRes?.results || []).filter(
            (m) => m.backdrop_path && m.id !== s.id
          );
        } catch {
          // If similar shows have an error try genre
        }

        if (!alive) return;

        if (similar.length) {
          setFallback(similar);
          return;
        }

        //Fallback: discover by first genre
        const firstGenreId = s?.genres?.[0]?.id;
        if (!firstGenreId) return;

        try {
          const discRes = await discoverTVByGenre(firstGenreId, 1);
          const genreItems = (discRes?.results || []).filter(
            (m) => m.backdrop_path && m.id !== s.id
          );
          if (!alive) return;
          setFallback(genreItems);
        } catch {
          // if this fails too don't show a recommended row
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
  // Youtube Trailer Extraction
  const trailer = useMemo(
    () =>
      videos.find(
        (x) => x.type === "Trailer" && x.site === "YouTube"
      ),
    [videos]
  );

  // Pick best logo if available
  const logo = useMemo(
    () => logos.find((l) => l.iso_639_1 === "en") || logos[0] || null,
    [logos]
  );

  if (err)
    return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!show)
    return <div style={{ padding: 16, color: "#fff" }}>Loading…</div>;
// Background Imagage Url
  const bg = show.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
    : undefined;
// Season, Episodes, Year
  const year = (show.first_air_date || "").slice(0, 4);
  const seasons = show.number_of_seasons;
  const episodes = show.number_of_episodes;

  // Episode Length
  const runtime =
    show.episode_run_time && show.episode_run_time.length
      ? show.episode_run_time[0]
      : null;

  // choose what to display: recommendations -> fallback -> nothing
  const recItems = recs.length ? recs : fallback;

  return (
    <div className="app">
      {/* Hero banner */}
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          background: bg ? `center/cover url(${bg})` : "#1b1329",
          minHeight: "100vh",
          display: "grid",
          alignItems: "end",
        }}
      >
        <div
          style={{
            backdropFilter: "blur(2px)",
            background:
              "linear-gradient(180deg,rgba(0,0,0,0) 0, rgba(0,0,0,.65) 60%)",
            padding: 24,
          }}
        >
          

           {/* Logo or text title */}
          {logo ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${logo.file_path}`}
              alt={show.name}
              style={{
                width: "40vw",
                maxWidth: "500px",
                marginBottom: 12,
                display: "block",
              }}
            />
          ) : (
            <h1 style={{ margin: 0 }}>
              {show.name}
              {year && ` (${year})`}
            </h1>
          )}

          <div style={{ opacity: 0.85, marginTop: 6 }}>
            {year && `${year} • `}
            {seasons && `${seasons} season${seasons > 1 ? "s" : ""}`}{" "}
            {episodes ? `• ${episodes} episodes` : ""}{" "}
            {runtime ? `• ~${runtime}m` : ""}{" "}
            {show.vote_average ? `• ${show.vote_average.toFixed(1)}★` : ""}
          </div>

          <p style={{ maxWidth: 800 }}>{show.overview}</p>

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

      {/* Recommendations / similar / genre fallback */}
      {recItems.length > 0 && (
        <>
          

          <SectionRow
            title="Recommended TV shows"
            items={recItems}
            getHref={(s) => `/tv/${s.id}`}
          />
        </>
      )}
    </div>
  );
}
