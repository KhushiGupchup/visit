import { useNavigate } from "react-router-dom";

export default function PrivateNavbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-10 py-6 bg-white shadow z-50">
      <h1 className="text-2xl font-bold text-gray-800">
        Visitor Pass Management System
      </h1>

      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">{email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
