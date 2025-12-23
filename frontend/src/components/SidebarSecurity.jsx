import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx"; // adjust path

export default function SidebarSecurity() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/security/dashboard" },
    { name: "Scan QR", path: "/security/scan" },
  ];

  const linkClasses = (path) =>
    `block px-4 py-2 rounded-lg font-medium transition ${
      location.pathname === path
        ? "bg-teal-600 text-white"
        : "hover:bg-teal-100 hover:text-teal-700"
    }`;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 shadow-md z-50">
        <h2 className="text-xl font-bold text-teal-600">Security Panel</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-teal-600 font-bold text-2xl"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:flex md:w-64
        w-64 z-30`}
      >
        <div>
          <h2 className="text-xl font-bold mb-6 hidden md:block text-teal-600">
            Security Panel
          </h2>

          <ul className="space-y-3">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={linkClasses(link.path)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout */}
        {/* <button
          onClick={logout}
          className="mt-6 w-full text-left text-red-400 hover:text-red-600 font-semibold transition"
        >
          Logout
        </button> */}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-25 z-40 md:hidden"
        ></div>
      )}
    </>
  );
}
