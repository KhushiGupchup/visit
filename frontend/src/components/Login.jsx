import React, { useState } from "react";
import { loginUser } from "../connect/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(email, password);
      console.log("Login Success:", res);

      alert("Login Successful!");

      // Save token to localStorage
      localStorage.setItem("token", res.token);

      // Redirect based on role
      if (res.role === "admin") window.location.href = "/admin";
      else if (res.role === "employee") window.location.href = "/employee";
      else window.location.href = "/security";

    } catch (err) {
      console.log("Login Failed:", err);
      alert(err.msg || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 text-left"
              htmlFor="username"
            >
              Email
            </label>

            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your Email"
              required
            />
          </div>

          <label className="text-left block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your Password"
            required
          />

          <button className="cursor-pointer bg-teal-400 hover:bg-teal-500 text-white font-bold py-2 px-5 w-full rounded-xl text-white-700 mt-8">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
