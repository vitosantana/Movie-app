import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
// Gives an easy way to read query parameters from the URL
function useQuery() {
const { search } = useLocation();
return useMemo (() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
const q = useQuery();
const token = q.get("token") || ""; // Looks in the URL query parameters for a key called token and displays its value
const navigate = useNavigate();
const [password, setPassword] = useState("");
const [status, setStatus] = useState("idle");
const [message, setMessage] = useState("");
const disabled = !token || password.length < 6 || status === "loading";

async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
    const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({token, password}),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null
    if (!res.ok) {
    setStatus("error");
    setMessage(data?.error || "Reset failed. The link may be expired.");
    return
    }

    setStatus("sent");
    setMessage("Password updated. You can sign in now.");
    setTimeout(() => navigate("/login"), 800);
    } catch (err) {
        console.log(err);
        setStatus("error");
        setMessage("Network error. Try again.");
    }
    
}

return (
<div className="auth-page">
<form className="auth-card" onSubmit={handleSubmit}>
    <h1>Reset Password</h1>

    {!token && (
        <p className="auth-error">
        Missing reset token. PLease use the link from your email.
        </p>
    )}

    {message && (
    <p className = {status === "error" ? "auth-error" : "auth-success"}>
        {message}
    </p>
    )}

    <label>
    New Password (min 6 chars)
    <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    />
    </label>

    <button className="autn-btn" type="submit" disabled={disabled}>
        {status === "loading" ? "Updating…" : "Update Password"}
    </button>

    <p className="auth-switch">
        <Link to="/login">Back to Sign In</Link>
    </p>
</form>
</div>
)
}