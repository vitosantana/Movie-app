import { Link } from "react-router-dom";
import { getHrefForItem } from "../utils/getHrefForItem";
import "./PosterCard.css";

export default function PosterCard({
  item,
  showRemove = false,   // show Remove button (My List page only)
  onRemove = () => {},
}) {
  const href = getHrefForItem(item);

  return (
    <Link to={href} className="poster-card">
      <div className="poster-thumb-wrap">
        <img
          className="poster-thumb"
          src={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/placeholder-500.png"
          }
          alt={item.title || item.name}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="poster-hover">
          <button className="poster-play" type="button">
            ▶
          </button>

          {showRemove && (
            <button
              className="poster-remove"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRemove(item);
              }}
            >
              Remove from My List
            </button>
          )}
        </div>
      </div>

      <div className="poster-caption">
        {item.title || item.name}
      </div>
    </Link>
  );
}
