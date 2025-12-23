import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowed }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (!allowed.includes(user.role)) {
    return <h1 className="text-center text-3xl mt-20">Access Denied</h1>;
  }

  return children;
}
