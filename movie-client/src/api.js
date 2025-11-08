console.log("ALL ENV:", import.meta.env);
console.log("TOKEN:", import.meta.env.VITE_TMDB_TOKEN);
const BASE = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN; // pulls from .env

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TOKEN}`, // correct format for v4
    },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export const getTrending        = () => get(`/trending/movie/week?language=en-US`);
export const getMovie           = (id) => get(`/movie/${id}?language=en-US`);
export const getMovieVideos     = (id) => get(`/movie/${id}/videos?language=en-US`);
export const getRecommendations = (id) => get(`/movie/${id}/recommendations?language=en-US&page=1`);
