import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import api from "../../utils/api.js";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await api.get("/admin/employees");
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEmployees();
  }, []);

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">All Employees</h1>

        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-t">
                <td className="px-4 py-2">{emp.empId}</td> {/* 👈 shows 1001 */}
                <td className="px-4 py-2">{emp.name}</td>
                <td className="px-4 py-2">{emp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
