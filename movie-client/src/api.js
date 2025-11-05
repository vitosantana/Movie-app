const BASE = "/api"; // dev uses proxy; prod same domain

export async function getTrending() {
  const r = await fetch(`${BASE}/trending`);
  if (!r.ok) throw new Error("trending failed");
  return r.json();
}

export async function searchMovies(q) {
  const r = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`);
  if (!r.ok) throw new Error("search failed");
  return r.json();
}

export async function getMovie(id) {
  const r = await fetch(`${BASE}/movie/${id}`);
  if (!r.ok) throw new Error("movie failed");
  return r.json();
}
