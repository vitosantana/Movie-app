import { useEffect, useMemo, useState } from "react";
import { getTrendingTV, getTVImages, discoverTVByGenre } from "../api";       
import HeroSlider from "../components/HeroSlider";
import SectionRow from "../components/SectionRow";
import "../index.css";

export default function TV() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
   const [heroLogos, setHeroLogos] = useState({});

      // Add genre
  const [actionTV, setActionTV] = useState([]);
  const [comedyTV, setComedyTV] = useState([]);
  const [scifiTV, setScifiTV] = useState([]);

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
  }, [data]); // runs again whenever there's fresh data

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

   // Fetch logos for hero TV items
  useEffect(() => {
    if (!heroItems.length) return;

    let alive = true;

    async function loadTVHeroLogos() {
      try {
        const results = await Promise.all(
          heroItems.map((show) => getTVImages(show.id))
        );

        if (!alive) return;

        const map = {};
        heroItems.forEach((show, idx) => {
          const logos = results[idx]?.logos || [];
          const logo =
            logos.find((l) => l.iso_639_1 === "en") || logos[0] || null;
          if (logo) {
            map[show.id] = logo;
          }
        });

        setHeroLogos(map);
      } catch (e) {
        console.warn("TV hero logos error:", e);
      }
    }

    loadTVHeroLogos();

    return () => {
      alive = false;
    };
  }, [heroItems]);


   //fetch TV genres
  useEffect(() => {
    let alive = true;

    async function loadTVGenres() {
      try {
        const [actionRes, comedyRes, scifiRes] = await Promise.all([
          // TMDB TV genre IDs:
          discoverTVByGenre(10759, 1),
          discoverTVByGenre(35, 1),
          discoverTVByGenre(10765, 1),
        ]);

        if (!alive) return;

        setActionTV(actionRes?.results || []);
        setComedyTV(comedyRes?.results || []);
        setScifiTV(scifiRes?.results || []);
      } catch (e) {
        console.warn("TV genre rows error:", e);
      }
    }

    loadTVGenres();

    return () => {
      alive = false;
    };
  }, []);

  //helpers for unique, randomized rows
  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const usedIds = new Set();

  const makeRow = (source, max = 20) => {
    const result = [];
    for (const item of shuffle(source)) {
      if (!item || !item.id) continue;
      if (usedIds.has(item.id)) continue; // skip duplicates across sections
      usedIds.add(item.id);
      result.push(item);
      if (result.length >= max) break;
    }
    return result;
  };

  // build de-duplicated TV rows
  const recommendedRow = makeRow(recommended, 20);
  const tvNightRow = makeRow(
    tvNight.length ? tvNight : recommended,
    20
  );
  const actionRow = makeRow(actionTV, 20);
  const comedyRow = makeRow(comedyTV, 20);
  const scifiRow = makeRow(scifiTV, 20);


  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 16 }}>Loading TV shows…</div>;

   return (
    <>
      {/* Hero slider with TV logos */}
      <HeroSlider
        items={heroItems}
        getHref={(show) => `/tv/${show.id}`}
        logosById={heroLogos}
      />

      <div className="app">
        <SectionRow
          title="Recommended TV"
          items={recommended}
          getHref={(show) => `/tv/${show.id}`}
          sectionHref="/tv/category/recommended-tv"
        />

    

        <SectionRow
          title="Binge Tonight"
          items={tvNight.length ? tvNight : recommended}
          getHref={(show) => `/tv/${show.id}`}
          sectionHref="/tv/category/binge-tonight"
        />

          {actionRow.length > 0 && (
          <SectionRow
            title="Action & Adventure"
            items={actionRow}
            getHref={(show) => `/tv/${show.id}`}
            sectionHref="/tv/category/action"
          />
        )}

        {comedyRow.length > 0 && (
          <SectionRow
            title="Comedy"
            items={comedyRow}
            getHref={(show) => `/tv/${show.id}`}
            sectionHref="/tv/category/comedy"
          />
        )}

        {scifiRow.length > 0 && (
          <SectionRow
            title="Sci-Fi & Fantasy"
            items={scifiRow}
            getHref={(show) => `/tv/${show.id}`}
            sectionHref="/tv/category/scifi"
          />
           )}
      </div>
    </>
  );
}
