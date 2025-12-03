require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken")
const users = []; // [{ id, email, passwordHash }]
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const watchlists = {};

console.log("TMDB_API_KEY present?", !!process.env.TMDB_API_KEY);
console.log(
  "TMDB_API_KEY first 5 chars:",
  process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.slice(0, 5) : "none"
);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const TMDB = axios.create({
  baseURL: "https://api.themoviedb.org/3",
});


// Authorization Middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "missing_token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload should contain at least user id + email
    req.user = payload;
    next();
  } catch (e) {
    console.error("auth_error:", e.message);
    return res.status(401).json({ error: "invalid_token" });
  }
}


// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // check if user already exists
    const existing = users.find(u => u.email === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      email: email.toLowerCase(),
      passwordHash,
    };
    users.push(newUser);

    // create JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email },
      token,
    });
  } catch (err) {
    console.error("register_failed:", err);
    res.status(500).json({ error: "register_failed" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error("login_failed:", err);
    res.status(500).json({ error: "login_failed" });
  }
});

//Protects Backend Routes

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "missing_token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
     const user = users.find(
      (u) => u.id === payload.id && u.email === payload.email
    );
      if (!user) {
      return res.status(401).json({ error: "user_not_found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

// example protected route
app.get("/api/profile", requireAuth, (req, res) => {
  res.json({ message: "Secure data", user: req.user });
});
// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Trending
app.get("/api/trending", async (_req, res) => {
  try {
    const r = await TMDB.get("/trending/movie/week", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "en-US",
      },
    });
    res.json(r.data);
  } catch (e) {
    console.error(
      "TMDB ERROR trending:",
      e?.response?.status,
      e?.response?.data || e?.message
    );
    res
      .status(e?.response?.status || 500)
      .json({ error: "trending_failed" });
  }
});

// Search
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const r = await TMDB.get("/search/movie", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: q,
        include_adult: false,
        language: "en-US",
      },
    });
    res.json(r.data);
  } catch (e) {
    console.error(
      "TMDB ERROR search:",
      e?.response?.status,
      e?.response?.data || e?.message
    );
    res
      .status(e?.response?.status || 500)
      .json({ error: "search_failed" });
  }
});

// Movie details
app.get("/api/movie/:id", async (req, res) => {
  try {
    const r = await TMDB.get(`/movie/${req.params.id}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        append_to_response: "images,credits,videos,releases",
        language: "en-US",
      },
    });
    res.json(r.data);
  } catch (e) {
    console.error(
      "TMDB ERROR movie:",
      e?.response?.status,
      e?.response?.data || e?.message
    );
    res
      .status(e?.response?.status || 500)
      .json({ error: "movie_failed" });
  }
});

/* Watch List Routes */


// Get current user's watchlist
app.get("/api/me/watchlist", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const items = watchlists[userId] || [];
  res.json({ items });
});

// Add an item to watchlist
app.post("/api/me/watchlist", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { id, media_type, title, name, poster_path } = req.body;

  if (!id) {
    return res.status(400).json({ error: "missing_id" });
  }

  if (!watchlists[userId]) {
    watchlists[userId] = [];
  }

  const existing = watchlists[userId].find((x) => x.id === id);
  if (!existing) {
    watchlists[userId].push({
      id,
      media_type: media_type || "movie",
      title: title || name || "",
      poster_path: poster_path || null,
    });
  }

  res.json({ items: watchlists[userId] });
});

// Remove an item from watchlist
app.delete("/api/me/watchlist/:id", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const tmdbId = Number(req.params.id);

  const items = watchlists[userId] || [];
  watchlists[userId] = items.filter((x) => x.id !== tmdbId);

  res.json({ items: watchlists[userId] });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
