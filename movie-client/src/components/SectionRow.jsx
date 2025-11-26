import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function SectionRow({
  title,
  items = [],
  getHref = (m) => `/movie/${m.id}`,
   sectionHref, 
}) {
  const ref = useRef(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true); 

  const scrollByCards = (dir) => {
    const el = ref.current;
    if (!el) return;

    el.scrollBy({
      left: dir * el.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  // detect if we can scroll + whether we're at the start/end
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;

      // if row isn't scrollable at all, hide both arrows
      if (maxScroll <= 0) {
        setAtStart(true);
        setAtEnd(true);
        return;
      }

      setAtStart(el.scrollLeft <= 0);
      setAtEnd(el.scrollLeft >= maxScroll - 1);
    };

    // when items change, reset to far left
    el.scrollLeft = 0;
    update();

    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

   return (
    <>
      <div className="section">
        <div className="section-title">
          {sectionHref ? (
            <Link to={sectionHref} className="section-link">
              <span>{title}</span>
              <span className="chev">›</span>
            </Link>
          ) : (
            <>
              <span>{title}</span>
              <span className="chev">›</span>
            </>
          )}
        </div>
      </div>

      <div className="row">
        {/* show left arrow only if we're not at the start */}
        {!atStart && (
          <button
            className="arrow left"
            onClick={() => scrollByCards(-1)}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        )}

        <div className="scroller" ref={ref}>
          {items
      .filter((m) => !!m.poster_path) // remove items with no poster
        .map((m) => (
        <Link key={m.id} to={getHref(m)} className="card">
        <img
          className="thumb"
          src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
          alt={m.title || m.name}
          loading="lazy"
        />
         <div className="caption">{m.title || m.name}</div>
        </Link>
          ))}
        </div>


        {/* show right arrow only if we're not at the end */}
        {!atEnd && (
          <button
            className="arrow right"
            onClick={() => scrollByCards(1)}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
