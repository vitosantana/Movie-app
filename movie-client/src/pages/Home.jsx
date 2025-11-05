//Renders Trending Movies Posters
import { useEffect, useState } from "react";
import { getTrending } from "../api";
import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";


export default function Home() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getTrending().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 16 }}>Loading…</div>;
  console.log("TEST URL:", `https://image.tmdb.org/t/p/w1280${
  (data.results || []).find(x => x.backdrop_path)?.backdrop_path || ""
}`);

return (

  
  <div style={{ padding: 16 }}>

    {/* 👇 Hero Slider */}
    <HeroSlider items={(data.results || []).slice(0, 12)} />

    {/* 👇 The grid of posters below */}
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}
    >
      {data.results?.map((m) => (
        <Link
          key={m.id}
          to={`/movie/${m.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {m.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              alt={m.title}
              loading="lazy"
              style={{ width: "100%", borderRadius: 8 }}
            />
          )}
          <div style={{ marginTop: 8, fontWeight: 600 }}>{m.title}</div>
        </Link>
      ))}
    </div>
  </div>
);



}
