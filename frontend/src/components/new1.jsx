import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import SidebarEmployee from "./EmployeeSidebar.jsx";
import * as XLSX from "xlsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

export default function VisitorList() {
  const [visitors, setVisitors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const fetchVisitors = async () => {
      try {
        const res = await api.get("/admin/visitors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVisitors(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) logout();
      }
    };

    fetchVisitors();
  }, [navigate, user, logout]);

  /* ---------- SEARCH FILTER ---------- */
  const filteredVisitors = visitors.filter((v) => {
    const name = v.name || "";
    const email = v.email || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  /* ---------- PAGINATION ---------- */
  const totalEntries = filteredVisitors.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ---------- STATUS STYLE ---------- */
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-teal-600 text-white";
      case "approved":
        return "bg-teal-600 text-white";
      case "rejected":
        return "bg-teal-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  /* ---------- EXPORT ALL DATA ---------- */
  const handleExport = () => {
    const exportData = visitors.map((v, index) => ({
      "S.No": index + 1,
      Name: v.name || "",
      Email: v.email || "",
      Phone: v.phone || "",
      Host: v.host || "",
      Status: v.status || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitors");

    XLSX.writeFile(workbook, "all_visitors.xlsx");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto md:ml-64">
        <Topbar />

        <div className="p-9 flex-1 overflow-auto mt-10">
          <h1 className="text-2xl font-bold mb-6">All Visitors</h1>

          <div className="bg-white shadow-md rounded-lg p-4 space-y-4">
            {/* Search + Export */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-4 py-2 max-w-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
              />

              <div className="flex items-center gap-4">
                <div className="text-sm text-teal-700 font-semibold border border-teal-200 rounded px-3 py-3 bg-teal-50">
                  Total entries: {totalEntries}
                </div>

                <button
                  onClick={handleExport}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded shadow"
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border border-gray-200">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Host</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVisitors.length > 0 ? (
                    paginatedVisitors.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 font-medium">{v.name}</td>
                        <td className="px-6 py-3 text-blue-600 underline">
                          {v.email}
                        </td>
                        <td className="px-6 py-3">{v.phone}</td>
                        <td className="px-6 py-3">{v.host}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClass(
                              v.status
                            )}`}
                          >
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-6 text-gray-500 font-medium"
                      >
                        No visitors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700">
                  Rows per page:
                </label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
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
