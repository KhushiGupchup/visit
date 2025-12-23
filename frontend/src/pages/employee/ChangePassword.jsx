import { useState } from "react";
import SidebarEmployee from "../../components/SidebarEmployee";
import api from "../../utils/api.js";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function ChangePassword() {
  const { logout } = useContext(AuthContext);
  const [form, setForm] = useState({ empId: "", email: "", newPassword: "", confirmPassword: "" });

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
    <div className="flex">
      <SidebarEmployee />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Change Password</h1>

        <input className="border p-2 mb-2 w-full rounded" placeholder="Employee ID" value={form.empId} onChange={e=>setForm({...form, empId:e.target.value})}/>
        <input className="border p-2 mb-2 w-full rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input type="password" className="border p-2 mb-2 w-full rounded" placeholder="New Password" value={form.newPassword} onChange={e=>setForm({...form, newPassword:e.target.value})}/>
        <input type="password" className="border p-2 mb-2 w-full rounded" placeholder="Confirm Password" value={form.confirmPassword} onChange={e=>setForm({...form, confirmPassword:e.target.value})}/>

        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Change Password</button>
      </div>
    </div>
  );
}
