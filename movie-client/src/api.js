console.log("ALL ENV:", import.meta.env);
console.log("TOKEN:", import.meta.env.VITE_TMDB_TOKEN);
const BASE = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN; // pulls from .env

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { //Informs TMDB of my identity
      accept: "application/json",
      Authorization: `Bearer ${TOKEN}`, // correct format for v4 / includes my API token in the request
    },
  });

  /* Error Handling */
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}
  /* Named exports opposed to using default exports */
export const getTrending        = () => get(`/trending/movie/week?language=en-US`);
export const getMovie           = (id) => get(`/movie/${id}?language=en-US`);
export const getMovieVideos     = (id) => get(`/movie/${id}/videos?language=en-US`);
export const getRecommendations = (id) => get(`/movie/${id}/recommendations?language=en-US&page=1`);


// Search movies 
export async function searchMovies(query = "", page = 1) {
  const q = (query || "").trim();
  if (!q) {
    // return same shape as TMDB search response so callers don't crash
    return { page: 1, results: [], total_results: 0, total_pages: 0 };
  }
  const encoded = encodeURIComponent(q);
  const path = `/search/movie?language=en-US&query=${encoded}&page=${page}&include_adult=false`;
  return get(path);
}

