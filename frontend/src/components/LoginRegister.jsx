import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import NavbarComponent from "./Navbar_new";
import logoVisio from "../assets/logo_new.png";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login"); // login or register tab

  // Login states
  const [loginType, setLoginType] = useState("visitor"); // visitor role always for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register states
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  //  login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter both email and password");

    try {
      //check whether user or visitor is doing login and use api
      const endpoint = loginType === "user" ? "/auth/login" : "/visitor/visitor/login";
      const res = await api.post(endpoint, {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      localStorage.setItem("token", res.data.token);//token
      
      //save login data
      login({ email: res.data.email, role: res.data.role, empId: res.data.empId || null });

      //after successful login go the that role dashboard 
      const routeMap = {
        admin: "/admin/dashboard",
        employee: "/employee/dashboard",
        security: "/security/dashboard",
        visitor: "/visitor/dashboard",
      };

      navigate(routeMap[res.data.role] || "/");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
      setPassword("");
    }
  };

  //  register visitor
  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword.trim() !== regConfirm.trim()) return alert("Passwords do not match");

    try {
      //call backend api
      await api.post("/visitor/register", {
        email: regEmail.trim().toLowerCase(),
        password: regPassword.trim(),
        confirmPassword: regConfirm.trim(),
      });

      alert("Visitor registered successfully! You can now login.");
      //after register set it to login tab
      setActiveTab("login");
      //reset the form
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-500 flex flex-col">
      <NavbarComponent />
      <div className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-md sm:max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <img src={logoVisio} alt="Logo" className="h-16 w-auto" />
          </div>

          {/* Tabs  for login or register */}
          <div className="flex border-b border-gray-300 mb-6">
            {["login", "register"].map((tab) => (
              <h1
                key={tab}
                className={`flex-1 text-center py-2 text-xl font-bold cursor-pointer ${
                  activeTab === tab
                    ? "text-teal-600 border-b-2 border-teal-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "login" ? "Login" : "Register Visitor"}
              </h1>
            ))}
          </div>

          {/* login form for both user and vistor according to tab */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Select user type */}
              <div className="flex justify-center space-x-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="loginType"
                    value="user"
                    checked={loginType === "user"}
                    onChange={() => setLoginType("user")}
                  />
                  <span>User</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="loginType"
                    value="visitor"
                    checked={loginType === "visitor"}
                    onChange={() => setLoginType("visitor")}
                  />
                  <span>Visitor</span>
                </label>
              </div>
              {/* email*/}
              
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
                {/* password*/}
              
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
              <button className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-all">
                Login
              </button>
            </form>
          )}

          {/* form  for visitor register*/}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              

              {/*email */}
              <input
                type="email"
                placeholder="Visitor Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />

              {/*password*/}
              <input
                type="password"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
              {/*confirm password*/}
              <input
                type="password"
                placeholder="Confirm Password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                required
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              />
              <button className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-all">
                Register Visitor
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

