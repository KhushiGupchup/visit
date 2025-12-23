
<h1>Employee</h1>// import React, { useState, useContext } from "react";
// import Sidebar from "./Sidebar";
// import api from "../utils/api"; // Axios instance
// import { AuthContext } from "../context/AuthContext";

// export default function AddEmployee() {
//   const { user } = useContext(AuthContext);
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     department: "",
//     role: "employee",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await api.post("/admin/add-employee", form);
//       alert(res.data.msg);
//       setForm({ name: "", email: "", department: "", role: "employee" });
//     } catch (err) {
//       alert(err.response?.data?.msg || "Error adding employee");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar />

//       <div className="flex-1 p-8">
//         <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

//         <form
//           onSubmit={handleSubmit}
//           className="bg-white shadow rounded-lg p-6 max-w-md"
//         >
//           <div className="mb-4">
//             <label className="block font-medium mb-1">Name</label>
//             <input
//               type="text"
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               placeholder="Full Name"
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-teal-300"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block font-medium mb-1">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="Email Address"
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-teal-300"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block font-medium mb-1">Department</label>
//             <input
//               type="text"
//               name="department"
//               value={form.department}
//               onChange={handleChange}
//               placeholder="Department"
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-teal-300"
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block font-medium mb-1">Role</label>
//             <select
//               name="role"
//               value={form.role}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-teal-300"
//             >
//               {/* <option value="employee">Employee</option> */}
//               <option value="security">Security</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold transition"
//           >
//             {loading ? "Adding..." : "Add Employee"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
