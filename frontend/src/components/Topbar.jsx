import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faGear } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const username = user?.email?.split("@")[0] || "User";
  const firstLetter = username[0]?.toUpperCase() || "U";
  const empId = user?.empId;
  const role = user?.role || "employee";

  return (
    <header
  className="
    fixed
    top-16 md:top-0
    left-0 md:left-64
    right-0
    h-20
    bg-white shadow
    flex justify-end items-center
    px-6
    z-[40]
  "
>

      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 bg-teal-100 hover:bg-teal-200 px-4 py-2 rounded-full font-medium text-gray-700"
        >
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-500 text-white font-bold text-lg">
            {firstLetter}
          </span>

          <FontAwesomeIcon
            icon={dropdownOpen ? faChevronUp : faChevronDown}
            className="text-teal-500"
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-teal-50 shadow-xl rounded-xl border border-gray-200 z-[60]">
            <div className="px-5 py-3 border-b border-gray-200">
              <div className="text-lg font-semibold">{username}</div>
            </div>

            <div className="px-5 py-2 border-b border-gray-200 truncate text-gray-700">
              {user?.email}
            </div>

            {role === "employee" && empId && (
              <div className="px-5 py-2 border-b border-gray-200 text-gray-700">
                Emp ID: {empId}
              </div>
            )}

            <div className="px-5 py-2 border-b border-gray-200 text-gray-700">
              Role: {role}
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="w-full text-left px-5 py-3 hover:bg-teal-500 hover:text-white font-semibold"
            >
              <FontAwesomeIcon icon={faGear} /> Settings
            </button>

            <button
              onClick={logout}
              className="w-full text-center px-5 py-3 hover:bg-red-500 hover:text-white font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
