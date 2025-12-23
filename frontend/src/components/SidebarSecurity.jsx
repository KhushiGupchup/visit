import { Link, useNavigate } from "react-router-dom";

export default function SidebarSecurity() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove auth token
    navigate("/login");                // redirect to login page
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-10">Security Panel</h2>

        <ul className="space-y-4">
          <li>
            <Link to="/security/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/security/scan" className="hover:text-blue-400">
              Scan QR
            </Link>
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-10 w-full text-left text-red-400 hover:text-red-600"
      >
        Logout
      </button>
    </div>
  );
}
