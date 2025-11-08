import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Movie from "./pages/Movie";   // ← new page

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<Movie />} />  {/* ← detail route */}
      {/* <Route path="*" element={<NotFound />} />  // optional */}
    </Routes>
  );
}
