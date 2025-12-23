import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="w-full bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold">Visitor Management System</h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className="font-medium">Logged in as: {user.role}</span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
