import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getWatchlist } from "../api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // ✅ keep token in React state so UI updates immediately after login
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // ✅ call this after successful login
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken); // triggers effect below immediately
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setWatchlist([]);
  };

  useEffect(() => {
    // guarantees the app doesn't show old data
    if (!token) {
      setUser(null);
      setWatchlist([]);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Expiration check
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error("Token Expired");
      }

      setUser(decoded);

      // Load watchlist whenever token changes (login OR refresh)
      (async () => {
        try {
          const data = await getWatchlist();
          const arr = Array.isArray(data) ? data : data?.items || [];
          setWatchlist(arr);
        } catch (err) {
          console.error("load_watchlist_failed:", err);
          setWatchlist([]);
        }
      })();
    } catch (err) {
      console.error("auth token invalid:", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setWatchlist([]);
    }
  }, [token]); // ✅ IMPORTANT: depends on token now

  return (
    <AuthContext.Provider
      value={{
        user,
        watchlist,
        setWatchlist,
        login,   // ✅ expose login
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
