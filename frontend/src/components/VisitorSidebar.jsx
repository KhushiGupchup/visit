import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function SidebarVisitor() {
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const linkClasses = "block px-4 py-2 rounded-lg font-medium transition";

  const links = [
  { name: "My Visits", path: "/visitor/dashboard" },
  { name: "Schedule Visit", path: "/visitor/schedule-visit" },
];


  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 shadow-md z-50">
        <h2 className="text-xl font-bold">Menu</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-teal-600 font-bold text-2xl"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

    <aside
  className={`
    fixed top-0 left-0 h-screen bg-white shadow-lg p-6 flex flex-col justify-between
    w-64 z-30
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
>
  {/* Menu Links */}
  <div className="flex-1 overflow-y-auto">
    <h2 className="text-xl font-bold mb-6 hidden md:block">Menu</h2>
    <nav className="space-y-3">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `${linkClasses} ${
              isActive
                ? "bg-teal-500 text-white"
                : "hover:bg-teal-100 hover:text-teal-700"
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  </div>


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
