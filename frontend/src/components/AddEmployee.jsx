import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import SidebarEmployee from "./EmployeeSidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AddEmployee() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
//take all data
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "employee",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");//get token
    if (!token || !user) navigate("/login");
  }, [navigate, user]);
//on add employee call backend api
  const handleSubmit = async () => {
    try {
      await api.post("/admin/add-employee", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Employee created. Credentials emailed to employee.");
      setForm({ name: "", email: "", department: "", role: "employee" });//set all form values
    } catch (err) {
      alert(err.response?.data?.msg || "Error creating employee");
    }
  };

  if (!user) return null;

  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
           {/* Sidebar */}
           <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />
     
           {/* Main content */}
           <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
             <Topbar />

        {/* Form for employee */}
        <div className="flex-1 overflow-y-auto pt-24 md:p-8 flex flex-col justify-center items-center">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-lg mt-9 ">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Employee
            </h1>
          
            <div className="space-y-4">
                {/* Name of employee*/}
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {/* email of emp*/}
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {/* department*/}
              <input
                type="text"
                placeholder="Department"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
               {/* role of employee*/}
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="employee">Employee</option>
                <option value="security">Security</option>
              </select>
            </div>
             {/* call the api*/}
            <button
              onClick={handleSubmit}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold mt-6 transition"
            >
              Create Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

