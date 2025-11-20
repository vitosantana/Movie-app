import { useEffect, useMemo, useState } from "react";
import { getTrending, getMovieImages, discoverMovieByGenre } from "../api";
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

  
  useEffect(() => {
    if (!data) return;

    // prevent browser from trying to restore scroll positions
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    //force all .scroller elements back to the far left
    const resetScroll = () => {
      const scrollers = document.querySelectorAll(".scroller");
      scrollers.forEach((el) => {
        el.scrollTo({ left: 0, behavior: "auto" });
      });
    };

    // run after this render
    const rafId = requestAnimationFrame(() => {
      resetScroll();
      // extra safety: run again a bit later in case the browser restores after first paint
      setTimeout(resetScroll, 50);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [data]); // runs again whenever you get fresh data
  
  // Font logos for heros
  const [heroLogos, setHeroLogos] = useState({});

  // Split the list into two sections (works regardless of the amount of items)
  const { recommended, movieNight, heroItems} = useMemo(() => {
    const list = items;
    const half = Math.ceil(list.length / 2);
    return {
      recommended: list.slice(0, half),
      movieNight:  list.slice(half),
      heroItems:   list.slice(0, 8),   // for the top carousel
    };
  }, [items]);
  

  // Add genre
const [action, setAction] = useState([]);
const [comedy, setComedy] = useState([]);
const [horror, setHorror] = useState([]);

  //fetch genre-based rows
  useEffect(() => {
    let alive = true;

    async function loadGenres() {
      try {
        const [a, c, h] = await Promise.all([
          discoverMovieByGenre(28, 1), // Action
          discoverMovieByGenre(35, 1), // Comedy
          discoverMovieByGenre(27, 1), // Horror
        ]);

        if (!alive) return;

        setAction(a?.results || []);
        setComedy(c?.results || []);
        setHorror(h?.results || []);
      } catch (e) {
        console.warn("Genre rows error:", e);
      }
    }

    loadGenres();
    return () => {
      alive = false;
    };
  }, []);



  // Fetch logos for hero movie items
  useEffect(() => {
    if (!heroItems.length) return;

    let alive = true;

    async function loadHeroLogos() {
      try {
        const results = await Promise.all(
          heroItems.map((item) => getMovieImages(item.id))
        );

        if (!alive) return;

        const map = {};
        heroItems.forEach((item, idx) => {
          const logos = results[idx]?.logos || [];
          const logo =
            logos.find((l) => l.iso_639_1 === "en") || logos[0] || null;
          if (logo) {
            map[item.id] = logo;
          }
        });

        setHeroLogos(map);
      } catch (e) {
        console.warn("Hero logos error:", e);
      }
    }

    loadHeroLogos();

    return () => {
      alive = false;
    };
  }, [heroItems]);

// shuffle array without mutating original
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// build a row with unique movies
const usedIds = new Set();

const makeRow = (source, max = 20) => {
  const result = [];
  for (const item of shuffle(source)) {
    if (!item || !item.id) continue;
    if (usedIds.has(item.id)) continue; // skip duplicates

    usedIds.add(item.id);
    result.push(item);

    if (result.length >= max) break;
  }
  return result;
};

// build rows without duplicated movies
const recommendedRow = makeRow(recommended, 20);
const movieNightRow = makeRow(
  movieNight.length ? movieNight : recommended,
  20
);
const actionRow  = makeRow(action, 20);
const comedyRow  = makeRow(comedy, 20);
const horrorRow  = makeRow(horror, 20);



  //  Hook order is stable
  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 16, color: "#fff" }}>Loading…</div>;

  return (
    <>
      {/* Hero movie slider with logos */}
      <HeroSlider
        items={heroItems}
        getHref={(movie) => `/movie/${movie.id}`}
        logosById={heroLogos}
      />

      <div className="app">
       <SectionRow
    title="Recommended"
    items={recommendedRow}
    getHref={(movie) => `/movie/${movie.id}`}
    sectionHref="/movies/category/recommended"
  />

  <SectionRow
    title="Movie Night"
    items={movieNightRow}
    getHref={(movie) => `/movie/${movie.id}`}
    sectionHref="/movies/category/movie-night" 
  />


  {action.length > 0 && (
    <SectionRow
      title="Action Hits"
      items={actionRow}
      getHref={(movie) => `/movie/${movie.id}`}
      sectionHref="/movies/category/action"
    />
  )}

  {comedy.length > 0 && (
    <SectionRow
      title="Laugh Out Loud"
      items={comedyRow}
      getHref={(movie) => `/movie/${movie.id}`}
       sectionHref="/movies/category/comedy"
    />
  )}

  {horror.length > 0 && (
    <SectionRow
      title="Horror Nights"
      items={horrorRow}
      getHref={(movie) => `/movie/${movie.id}`}
      sectionHref="/movies/category/horror"
    />
  )}
      </div>
    </>
  );


}
