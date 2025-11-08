
import { useRef } from "react";
import { Link } from "react-router-dom";

export default function SectionRow({ title, items = [], getHref = (m)=>`/movie/${m.id}` }) {
  const ref = useRef(null);
  const scrollByCards = dir => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: "smooth" });

  return (
    <>
      <div className="section"><div className="section-title"><span>{title}</span><span className="chev">›</span></div></div>
      <div className="row">
        <button className="arrow left" onClick={() => scrollByCards(-1)}>‹</button>
        <div className="scroller" ref={ref}>
          {items.map(m => (
            <Link key={m.id} to={getHref(m)} className="card">
              <img
                className="thumb"
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                alt={m.title}
                loading="lazy"
              />
              <div className="caption">{m.title}</div>
            </Link>
          ))}
        </div>
        <button className="arrow right" onClick={() => scrollByCards(1)}>‹</button>
      </div>
    </>
  );
}
