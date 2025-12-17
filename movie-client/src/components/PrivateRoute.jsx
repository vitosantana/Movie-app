import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // If not logged in, send to login and track user intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //Show protected content once logged in
  return children;
}
