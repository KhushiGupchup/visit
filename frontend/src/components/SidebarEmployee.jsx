import { Link, useNavigate } from "react-router-dom";

export default function SidebarEmployee() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");   // clear auth token
    navigate("/login");                 // redirect to login
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-10">Employee Panel</h2>

        <ul className="space-y-4">
          <li>
            <Link to="/employee/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/employee/schedule-visitor"
              className="hover:text-blue-400"
            >
              Schedule Visitor
            </Link>
          </li>
          <li>
            <Link to="/employee/my-visitors" className="hover:text-blue-400">
              My Visitors
            </Link>
          </li>
          <li>
            <Link to="/employee/change-password" className="hover:text-blue-400">
              Change Password
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
