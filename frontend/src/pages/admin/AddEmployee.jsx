import { useState, useContext } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import api from "../../utils/api.js";
import { AuthContext } from "../../context/AuthContext";

export default function AddEmployee() {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "employee", // default role
  });

  const handleSubmit = async () => {
    try {
      await api.post("/admin/add-employee", form);
      alert("Employee created. Credentials emailed to employee.");
      setForm({ name: "", email: "", department: "", role: "employee" });
    } catch (err) {
      alert(err.response?.data?.msg || "Error creating employee");
    }
  };

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Add Employee</h1>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-3 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Department"
          className="border p-2 w-full mb-3 rounded"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />

        {/* Role Dropdown */}
        <select
          className="border p-2 w-full mb-3 rounded"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="employee">Employee</option>
          <option value="security">Security</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Employee
        </button>
      </div>
    </div>
  );
}
