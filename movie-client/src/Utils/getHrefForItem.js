// Search Result Optimization Helper

export function getHrefForItem(item) {
  // Prefer TMDB's media_type if present (from /search/multi)
  const type =
    item.media_type ||
    (item.first_air_date ? "tv" : "movie"); // fallback if media_type missing

  if (type === "tv") {
    return `/tv/${item.id}`;
  }

  // default: movie
  return `/movie/${item.id}`;
}