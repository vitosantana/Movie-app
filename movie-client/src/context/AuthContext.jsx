import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getWatchlist } from "../api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  useEffect(() => {
const token = localStorage.getItem("token");
// guarantees the app doesn't show old data
  if (!token) {
    setUser(null);
    setWatchlist([]);
    return;
  }

  try {
    const decoded = jwtDecode(token);
    // Expiration Check
    if (decoded.exp * 1000 < Date.now()) {
      throw new Error("Token Expired");
    }
    setUser(decoded);

    // Load watchlist after login / refresh
    (async () => {
      try {
        const data = await getWatchlist();
        // accepts either [ ... ](array) or { items: [...](items) }
        const arr = Array.isArray(data) ? data : data?.items || [];
        setWatchlist(arr);
      } catch (err) {
        console.error("load_watchlist_failed:", err);
        setWatchlist([]);
      }
    })();
  } catch {
    localStorage.removeItem("token");
    setUser(null);
    setWatchlist([]);
  }
}, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setWatchlist([]);  
  };

  return (
    <AuthContext.Provider value={{ user, setUser, watchlist, setWatchlist, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
