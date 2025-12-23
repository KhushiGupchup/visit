import { Link, useNavigate } from "react-router-dom";

export default function SidebarAdmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");   // remove auth token
    navigate("/login");                 // redirect to login page
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <ul className="space-y-4">
          <li>
            <Link to="/admin/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
          </li>

          <li>
            <Link to="/admin/add-employee" className="hover:text-blue-400">
              Add Employee
            </Link>
          </li>

          <li>
            <Link to="/admin/visitors" className="hover:text-blue-400">
              All Visitors
            </Link>
          </li>

          <li>
            <Link to="/admin/employees" className="hover:text-blue-400">
              View Employees
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
