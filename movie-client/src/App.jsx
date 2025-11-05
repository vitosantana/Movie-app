import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import Movie from "./pages/Movie.jsx";

export default function App() {
  return (
    <>
      <header style={{ padding: 16, display: "flex", gap: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<Movie />} />
      </Routes>
    </>
  );
}