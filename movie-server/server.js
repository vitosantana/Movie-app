require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken")
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
console.log("ATLAS_URI value:", process.env.ATLAS_URI);

// Mongo connection
mongoose
  .connect("mongodb+srv://D_Huggans314:Burb3rryTr3nch314@Movie-App.jt3dhue.mongodb.net/?appName=Movie-App", {
    dbName: "Movie-App",
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

  //  Mongoose models 

const watchlistItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true }, // TMDB numeric id
    media_type: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    poster_path: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    watchlist: { type: [watchlistItemSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);


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

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create ({
      email: normalizedEmail,
      passwordHash,
    });

    // create JWT
    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: { id: newUser._id.toString(), email: newUser.email },
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
    const normalizedEmail = email.toLowerCase();


    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
     user: { id: user._id.toString(), email: user.email },
      token,
    });
  } catch (err) {
    console.error("login_failed:", err);
    res.status(500).json({ error: "login_failed" });
  }
});

//Protects Backend Routes

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");


  if (!token) {
    return res.status(401).json({ error: "missing_token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
     const user = await User.findById(payload.id);
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
  res.json({
    message: "Secure data",
    user: {
      id: req.user._id.toString(),
      email: req.user.email,
      watchlistCount: req.user.watchlist.length,
    },
  });
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
app.get("/api/me/watchlist", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({ items: user.watchlist });
  } catch (err) {
    console.error("get_watchlist_failed:", err);
    res.status(500).json({ error: "get_watchlist_failed" });
  }
});


// Add an item to watchlist
app.post("/api/me/watchlist", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id, media_type, title, name, poster_path } = req.body;

    if (!id) {
      return res.status(400).json({ error: "missing_id" });
    }

    const existing = user.watchlist.find((x) => x.id === id);
    if (!existing) {
      user.watchlist.push({
        id,
        media_type: media_type || "movie",
        title: title || name || "",
        poster_path: poster_path || null,
      });
      await user.save();
    }

    res.json({ items: user.watchlist });
  } catch (err) {
    console.error("add_watchlist_failed:", err);
    res.status(500).json({ error: "add_watchlist_failed" });
  }
});

// Remove an item from watchlist
app.delete("/api/me/watchlist/:id", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const tmdbId = Number(req.params.id);

    user.watchlist = user.watchlist.filter((x) => x.id !== tmdbId);
    await user.save();

    res.json({ items: user.watchlist });
  } catch (err) {
    console.error("remove_watchlist_failed:", err);
    res.status(500).json({ error: "remove_watchlist_failed" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
})