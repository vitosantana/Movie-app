// server.js (CommonJS)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const TMDB = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${process.env.TMDB_BEARER}` },
});

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Trending
app.get("/api/trending", async (_req, res) => {
  try {
    const r = await TMDB.get("/trending/movie/week");
    res.json(r.data);
  } catch (e) {
    console.error("trending_failed:", e?.response?.status, e?.message);
    res.status(e?.response?.status || 500).json({ error: "trending_failed" });
  }
});

// Search
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const r = await TMDB.get("/search/movie", {
      params: { query: q, include_adult: false },
    });
    res.json(r.data);
  } catch (e) {
    console.error("search_failed:", e?.response?.status, e?.message);
    res.status(e?.response?.status || 500).json({ error: "search_failed" });
  }
});

// Movie details
app.get("/api/movie/:id", async (req, res) => {
  try {
    const r = await TMDB.get(`/movie/${req.params.id}`, {
      params: { append_to_response: "images,credits,videos,releases" },
    });
    res.json(r.data);
  } catch (e) {
    console.error("movie_failed:", e?.response?.status, e?.message);
    res.status(e?.response?.status || 500).json({ error: "movie_failed" });
  }
});

app.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);
