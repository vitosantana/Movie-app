// Load environment variables from .env
require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Create an axios instance for TMDB
const TMDB = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${process.env.TMDB_BEARER}` }
});

// Basic test route
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Trending movies (weekly)
app.get("/api/trending", async (_req, res) => {
  try {
    const r = await TMDB.get("/trending/movie/week");
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: "trending_failed", detail: e.message });
  }
});

// Search for movies
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const r = await TMDB.get("/search/movie", { params: { query: q } });
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: "search_failed", detail: e.message });
  }
});

// Movie details (with extras)
app.get("/api/movie/:id", async (req, res) => {
  try {
    const r = await TMDB.get(`/movie/${req.params.id}`, {
      params: { append_to_response: "images,credits,videos,releases" }
    });
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: "movie_failed", detail: e.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
