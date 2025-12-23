import { Link } from "react-router-dom";
import logoVisio from "../assets/logo_new.png";

export default function NavbarComponent() {
  return (
    <nav className="w-full flex justify-between items-center px-4 w-[ ] sm:px-10 py-4 bg-white/90 backdrop-blur-md fixed top-0 z-50 shadow-md">
      
      {/* Logo + Brand */}
      <Link to="/" className="flex items-center space-x-3">
        <img src={logoVisio} alt="Visio Logo" className="h-10 w-auto bg-white rounded-md p-2" />
        <div className="flex flex-col leading-tight">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Visio</h1>
          <span className="text-xs sm:text-sm text-gray-500">Visitor Pass Management</span>
        </div>
      </Link>

      {/* Buttons */}
      <div className="flex gap-2 sm:gap-4">
        {/* Register - filled */}
        <Link
          to="/visitor-register"
          className="bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-teal-700 transition transform hover:scale-105 text-sm sm:text-base"
        >
          Register
        </Link>

        {/* Login - outline */}
        <Link
          to="/login"
          className="border border-teal-600 text-teal-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-teal-50 hover:text-teal-700 transition transform hover:scale-105 text-sm sm:text-base"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
