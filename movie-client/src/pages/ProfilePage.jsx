import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);

  // If user is missing, render nothing
  if (!user) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Profile</h1>

        <div style={{ textAlign: "left", marginTop: "16px" }}>
          <p><strong>Email:</strong> {user.email}</p>
          {user.id && <p><strong>User ID:</strong> {user.id}</p>}

          <hr
            style={{
              margin: "20px 0",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />

         
        </div>
      </div>
    </div>
  );
}