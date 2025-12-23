import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import NavbarComponent from "./Navbar_new";
import logoVisio from "../assets/logo_new.png";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      login({
        email: res.data.email,
        role: res.data.role,
        empId: res.data.empId,
      });

      if (res.data.role === "admin") navigate("/admin/dashboard");
      else if (res.data.role === "employee") navigate("/employee/dashboard");
      else if (res.data.role === "security") navigate("/security/dashboard");
      else alert("Unknown role");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-500 flex flex-col">
      {/* Navbar */}
      <NavbarComponent />

      {/* Centered Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-md sm:max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8 relative overflow-hidden">

          {/* Teal Accent Top Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>

          {/* Logo Centered */}
          <div className="flex justify-start mb-6 sm:mb-8">
            <img
              src={logoVisio}
              alt="Visio Logo"
              className="h-18 sm:h-16 w-auto"
            />
          </div>

          {/* Left-aligned Title */}
          <div className="flex flex-col items-start mb-4 sm:mb-6 pl-1 sm:pl-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              Login
            </h2>
            {/* Accent underline */}
            <div className="h-1 w-16 sm:w-20 bg-teal-500 rounded-full mt-2 mb-4"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

            <div>
              <label className="block mb-1 text-gray-700 font-medium text-sm sm:text-base">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium text-sm sm:text-base">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none transition"
                required
              />
            </div>

            <button
              className="w-full bg-teal-500 text-white py-2.5 sm:py-3 rounded-lg text-lg font-semibold hover:bg-teal-600 shadow-md transition-all"
            >
              Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
