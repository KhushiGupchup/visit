import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEmployee from "./EmployeeSidebar.jsx";
import Topbar from "./Topbar.jsx";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      navigate("/login");
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await api.get("/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) logout();
      }
    };

    fetchEmployees();
  }, [navigate, user, logout]);

  const totalEntries = employees.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure? This will delete the employee and all related visitors.")) return;

    try {
      setLoadingId(empId);
      const token = localStorage.getItem("token");

      await api.delete(`/admin/employee/${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployees((prev) => prev.filter((emp) => emp.empId !== empId));
      alert("Employee and related visitors deleted successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error deleting employee");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />
      
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64 ">
              <Topbar />

        {/* Page content */}
        <div className="flex-1  p-6  overflow-auto ">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">All Employees</h1>

          <div className="bg-white shadow rounded-lg p-4 space-y-4">

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border border-gray-200">
                <thead className="bg-teal-500 text-white rounded-t-lg">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Employee ID</th>
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((emp, i) => (
                      <tr
                        key={emp._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className="px-6 py-3 font-medium text-gray-900">{emp.empId}</td>
                        <td className="px-6 py-3 text-gray-800">{emp.name}</td>
                        <td className="px-6 py-3 text-blue-800 underline">{emp.email}</td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => handleDelete(emp.empId)}
                            disabled={loadingId === emp.empId}
                            className={`px-3 py-1 rounded-full text-white font-semibold ${
                              loadingId === emp.empId
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-teal-500 hover:bg-red-600"
                            }`}
                          >
                            {loadingId === emp.empId ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500 font-medium">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">

              {/* Rows per page */}
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
