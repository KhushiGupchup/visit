import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white w-full shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide hover:text-gray-300"
          >
            Company System
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">

            {/* LOGIN DROPDOWN */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-md hover:bg-gray-700 transition">
                Login ▼
              </button>
              <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200">
                <Link className="block px-4 py-2 hover:bg-gray-700" to="/admin-login">Admin Login</Link>
                <Link className="block px-4 py-2 hover:bg-gray-700" to="/security-login">Security Login</Link>
                <Link className="block px-4 py-2 hover:bg-gray-700" to="/employee-login">Employee Login</Link>
                <Link className="block px-4 py-2 hover:bg-gray-700" to="/visitor-login">Visitor Login</Link>
              </div>
            </div>

            {/* REGISTER DROPDOWN */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-md hover:bg-gray-700 transition">
                Register ▼
              </button>
              <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200">
                <Link className="block px-4 py-2 hover:bg-gray-700" to="/visitor-register">
                  Visitor
                </Link>
              </div>
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="focus:outline-none p-2 hover:bg-gray-700 rounded-md"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 bg-gray-800 rounded-md shadow-lg">
            <Link className="block px-4 py-2 hover:bg-gray-700" to="/admin-login">Admin Login</Link>
            <Link className="block px-4 py-2 hover:bg-gray-700" to="/security-login">Security Login</Link>
            <Link className="block px-4 py-2 hover:bg-gray-700" to="/employee-login">Employee Login</Link>
            <Link className="block px-4 py-2 hover:bg-gray-700" to="/visitor-login">Visitor Login</Link>
            <Link className="block px-4 py-2 hover:bg-gray-700" to="/visitor-register">Visitor Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
