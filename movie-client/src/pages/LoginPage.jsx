import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();


  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      

      let data = null;

      // Try to parse JSON, but don't crash if it's invalid
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        console.warn("Login response was not valid JSON:", parseErr);
      }

      if (!res.ok) {
        // Show backend error if present, otherwise show status code
        const msg =
          data?.error ||
          `Login failed (status ${res.status}). Check server console for details.`;
        setError(msg);
        return;
      }
      

      login(data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Network error");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Sign In</h1>

        {error && <p className="auth-error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="auth-btn" type="submit">
          Sign In
        </button>
        <p className="forgot-password">
        <a href="/forgot-password">Forgot password?</a>
        </p>

        <p className="auth-switch">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}
