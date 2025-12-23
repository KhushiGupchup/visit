import { useState, useContext } from "react";
import SidebarEmployee from "../components/EmployeeSidebar";
import Topbar from "./Topbar.jsx";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext";

export default function ChangePassword() {
  const { logout } = useContext(AuthContext);
  const [form, setForm] = useState({
    empId: "",
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) return alert("Passwords do not match");
    try {
      await api.post("/employee/change-password", form);
      alert("Password changed. Please login again.");
      logout();
    } catch (err) {
      alert(err.response?.data?.msg || "Error changing password");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Topbar />

        <div className="flex-1 flex justify-center items-start p-4 md:p-6">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md mt-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
              Change Password
            </h1>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Employee ID"
                value={form.empId}
                onChange={(e) => setForm({ ...form, empId: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="password"
                placeholder="New Password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold mt-6 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
