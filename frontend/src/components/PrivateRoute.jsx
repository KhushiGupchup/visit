import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // Wait until AuthContext is initialized
  if (user === null && token) return null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
}
