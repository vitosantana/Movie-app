import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Movie from "./pages/Movie";
import TV from "./pages/TV";
import TVDetails from "./pages/TVDetails";




export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Home />} /> 
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<Movie />} />
           <Route path="/tv" element={<TV />} />
             <Route path="/tv/:id" element={<TVDetails />} /> 
        </Routes>
      </main>
    </>
  );
}
