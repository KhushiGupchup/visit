import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../utils/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      login({
        token: res.data.token,
        role: res.data.role,
        name: res.data.name,
      });

      // Redirect based on role
      switch (res.data.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "employee":
          navigate("/employee/dashboard");
          break;
        case "security":
          navigate("/security/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white shadow p-6 rounded max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-3 w-full rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-3 w-full rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded mt-2"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
