// pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { getTrending } from "../api";
import HeroSlider from "../components/HeroSlider";
import SectionRow from "../components/SectionRow";
import "../index.css";
console.log("ALL ENV:", import.meta.env);
console.log("TOKEN:", import.meta.env.VITE_TMDB_TOKEN);


export default function Home() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  // fetch once
  useEffect(() => {
    let alive = true;
    getTrending()
      .then(res => { if (alive) setData(res); })
      .catch(e => setErr(e.message));
    return () => { alive = false; };
  }, []);

  // Ensuring the Hooks are called every render
  const items = useMemo(() => data?.results ?? [], [data]);

  // Split the list into two sections (works regardless of the amount of items)
  const { recommended, movieNight, heroItems } = useMemo(() => {
    const list = items;
    const half = Math.ceil(list.length / 2);
    return {
      recommended: list.slice(0, half),
      movieNight:  list.slice(half),
      heroItems:   list.slice(0, 8)   // for the top carousel
    };
  }, [items]);

  //  Hook order is stable
  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 16, color: "#fff" }}>Loading…</div>;

  return (
    <div className="app">
      <HeroSlider items={heroItems} />
      <SectionRow title="Recommended" items={recommended} />
      <SectionRow title="Movie Night"  items={movieNight.length ? movieNight : recommended} />
    </div>
  );
}
