import { useState } from "react";
import { Link } from "react-router-dom";
export default function ForgotPasswordPage() {
 const [email, setEmail] = useState("");
 const [status, setStatus] = useState("idle"); 
 const [message, setMessage] = useState("");

 async function handleSubmit(e) {
  e.preventDefault();
  setStatus("loading");
  setMessage("");
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email})
    });

    const contentType = res.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.warn("Non-JSON response:", text.slice(0, 120));
    }

   // Even if email doesn't exist, respond like it's sent
   if (!res.ok) {
    setStatus("sent");
    setMessage("If that email exists, a reset link was sent.")
    return;
   }
   
   setStatus("sent");
   setMessage("If that email exists, a reset link was sent.")
  } catch (err) {
    console.error(err);
    setStatus("error");
    setMessage("Network error. Try again.")
    
  }
  }

  return (
    <div className = "auth-page forgot-page">
      <form className= "auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        {message && (
          <p className={status ==="error" ? "auth-error" : "auth-success"}>
            {message}
          </p>
        )}

        <label>
          Email
          <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          />
        </label>

        <button className="auth-btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to Sign in</Link>
        </p>
      </form>
    </div>
  );
 }

