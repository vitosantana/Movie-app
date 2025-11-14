import { useEffect, useMemo, useState } from "react";
import { getTrendingTV } from "../api";       
import HeroSlider from "../components/HeroSlider";
import SectionRow from "../components/SectionRow";
import "../index.css";

export default function TV() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  // fetch TV shows
  useEffect(() => {
    let alive = true;
    getTrendingTV()
      .then(res => { if (alive) setData(res); })
      .catch(e => setErr(e.message));
    return () => { alive = false; };
  }, []);

  // ensure items always exists
  const items = useMemo(() => data?.results ?? [], [data]);

  // split items into hero + rows 
  const { recommended, tvNight, heroItems } = useMemo(() => {
    const list = items;
    const half = Math.ceil(list.length / 2);
    return {
      recommended: list.slice(0, half),
      tvNight:     list.slice(half),
      heroItems:   list.slice(0, 8)     // top slides
    };
  }, [items]);

  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 16 }}>Loading TV shows…</div>;

  return (
     <div className="app">
    <HeroSlider
     items={heroItems}
     getHref={(show) => `/tv/${show.id}`} 
     />

    <SectionRow
      title="Recommended TV"
      items={recommended}
      getHref={(show) => `/tv/${show.id}`} 
    />

    <SectionRow
      title="Binge Tonight"
      items={tvNight.length ? tvNight : recommended}
      getHref={(show) => `/tv/${show.id}`}
    />
  </div>
  );
}
