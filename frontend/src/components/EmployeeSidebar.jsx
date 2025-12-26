import { NavLink, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function SidebarEmployee() {
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const location = useLocation();

  const linkClasses = "block px-4 py-2 rounded-lg font-medium transition";

  const employeelinks = [
    { name: "Dashboard", path: "/employee/dashboard" },
    { name: "Schedule Visitor", path: "/employee/schedule-visitor" },
    { name: "My Visitors", path: "/employee/my-visitors" },
  ];

  const adminlinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Add Employee", path: "/admin/add-employee" },
    { name: "See Visitors", path: "/admin/see-visitors" },
    { name: "See Employees", path: "/admin/see-employees" },
    { name: "Reports", path: "/admin/reports" },
  ];

  const securitylinks = [
    { name: "Dashboard", path: "/security/dashboard" },
    { name: "Scan QR", path: "/security/scan" },
  ];

  const visitorlinks = [
    { name: "My Visits", path: "/visitor/dashboard" },
    { name: "Schedule Visit", path: "/visitor/schedule-visit" },
  ];

  /* set sidebar links based on user role */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (!data) return;

    if (data.role === "employee") {
      setLinks(employeelinks);
    } else if (data.role === "admin") {
      setLinks(adminlinks);
    } else if (data.role === "security") {
      setLinks(securitylinks);
    } else if (data.role === "visitor") {
      setLinks(visitorlinks);
    } else {
      setLinks([]);
    }
  }, []);

  /* close sidebar when route changes */
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  /* stop body scroll when sidebar is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  return (
    <>
      {/* mobile top bar*/}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white p-4 shadow-md z-[60] flex justify-between items-center">
        <span className="font-bold text-teal-600">Menu</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-teal-600 font-bold text-2xl"
          aria-label="Toggle sidebar"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>
{/* Mobile Sidebar + Overlay */}

{isOpen && (
  <>
    {/* dark overlay behind sidebar */}
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
    />

    {/* sidebar panel from left*/}
    <div
      className={`fixed top-0 left-0 w-64 h-full bg-white z-60 md:hidden flex flex-col p-4 overflow-y-auto
      transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <nav className="flex flex-col space-y-3 mt-20">
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

        <button
          onClick={logout}
          className="text-left px-4 py-2 font-semibold text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </nav>
    </div>
  </>
)}



      {/* desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white shadow-lg flex-col justify-between overflow-y-auto z-50">
        <div className="pt-6 px-6">
          <h2 className="text-xl font-bold mb-6 border-b-4 border-teal-600 pb-1 w-16">
            Menu
          </h2>
          <nav className="space-y-3">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
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

      {/* mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/25 z-40 md:hidden"
        />
      )}
    </>
  );
}


