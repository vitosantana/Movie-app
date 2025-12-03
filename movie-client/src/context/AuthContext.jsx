import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
    return;
  }

  // Validate token with backend
    async function validateToken() {
      try {
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Token invalid OR backend restarted
          throw new Error("Invalid token");
        }

        // Token is valid — no action required
      } catch (err) {
        console.warn("Token validation failed:", err.message);
        logout(); // auto logout
      }
    }

    validateToken();
    // --------------------------------------------

  }, []); // runs once on page load

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
