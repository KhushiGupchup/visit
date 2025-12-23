import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

export default function VisitorTable() {
  const [visitors, setVisitors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) return;

        const res = await api.get("/admin/visitors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVisitors(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) logout();
      }
    }

    fetchVisitors();
  }, [user, logout]);

  const filteredVisitors = visitors.filter((v) => {
    const name = v.name || "";
    const email = v.email || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalEntries = filteredVisitors.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);

  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-teal-600";
      case "approved":
        return "bg-teal-600";
      case "rejected":
        return "bg-teal-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 space-y-4">

      {/* Search */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-4 py-2"
        />

        <div className="text-sm text-teal-700 font-semibold border border-teal-200 rounded px-3 py-3 bg-teal-50">
                Total entries: {totalEntries}
              </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border border-gray-200">
                <thead className="bg-teal-500 text-white rounded-t-lg">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Phone</th>
                    <th className="px-6 py-3 text-left font-semibold">Host</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVisitors.length > 0 ? (
                    paginatedVisitors.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 text-black font-medium">{v.name}</td>
                        <td className="px-6 py-3 text-blue-600 underline hover:text-teal-800 cursor-pointer">{v.email}</td>
                        <td className="px-6 py-3 text-black">{v.phone}</td>
                        <td className="px-6 py-3 text-black">{v.host}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-sm capitalize ${getStatusClass(v.status)}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500 font-medium">
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
                <label className="font-semibold text-gray-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-teal-400"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
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
  );
}
