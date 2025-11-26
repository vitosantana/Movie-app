import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchAll } from "../api"; 
import SectionRow from "../components/SectionRow"; 

export default function SearchPage() {
  const [params] = useSearchParams(); /* reads query parameters from the URL. for an example, If the URL is /search?q=superman, params gives access to "q=superman" */
  const q = params.get("q") || ""; //Extracts the value of q from the url
  const [loading, setLoading] = useState(false); // Tells the UI if we're waiting for results from the API
  const [err, setErr] = useState(""); // Stores an error message if the API fetch failed
  const [data, setData] = useState(null); // API return results get stored here
  const navigate = useNavigate(); // Allows navigating to another route
/* If no search term stop calling the API */
  useEffect(() => {
    if (!q.trim()) {
      setData(null);
      setErr("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr("");
    let alive = true;
    /* Calls TMDB API function, stores results in data, if API fails store error in err, when done stop loading indicator */
    searchAll(q, 1)
      .then(res => { if (alive) { setData(res); } })
      .catch(e => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [q]);

  return (
    <div className="search-results-page">
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 12px" }}>
          Search results for <span style={{ color: "#8a5cff" }}>{q || "…"}</span>
        </h2>

        {loading && <p>Loading…</p>}
        {err && <div style={{ color: "crimson" }}>Error: {err}</div>}

        {!loading && !err && data?.results?.length === 0 && (
          <div>No results found. Try another search.</div>
        )}

        {!loading && data && data.results?.length > 0 && (
          <>
           
            <div style={{ marginTop: 16 }}>
              <SectionRow title={`${data.total_results} Results`} items={data.results} />
            </div>
          </>
        )}

        {!q && (
          <div style={{ marginTop: 12 }}>
            <p>Type a movie name in the search (top-right) to find movies.</p>
          </div>
        )}
      </div>
    </div>
  );
}
