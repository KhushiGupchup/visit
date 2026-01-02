import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import SidebarEmployee from "../components/EmployeeSidebar.jsx";
import Topbar from "./Topbar.jsx";
import api from "../utils/api.js";
import toast from "react-hot-toast";


import { AuthContext } from "../context/AuthContext.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

export default function MyVisitors() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSlot, setSelectedSlot] = useState("all"); // 
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [viewModal, setViewModal] = useState({ open: false, visitor: null });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee") navigate("/login");
  }, [user, navigate]);

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/employee/my-visitors");
      console.log("Fetched visitors:", res.data); // 
      setVisitors(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (user) fetchVisitors();
  }, [user]);

  const handleAction = async (visitor, action) => {
    setLoadingId(visitor._id);

    try {
      let res;

      if (action === "approve") {
        res = await api.post(`/employee/approve-visitor/${visitor._id}`);
        toast.success(res.data.msg);
      }

      else if (action === "reject") {
        res = await api.patch(`/employee/reject-visitor/${visitor._id}`);
        toast.success(res.data.msg);
      }

      else if (action === "delete") {
        if (!window.confirm("Are you sure you want to delete this visitor?")) return;
        await api.delete(`/employee/delete-visitor/${visitor._id}`);
        toast.success("Visitor deleted successfully");
      }

      fetchVisitors();

    } catch (err) {
      toast.error(err.response?.data?.msg || "Error updating visitor");
    } finally {
      setLoadingId(null);
      setStatusDropdown(null);
    }
  };



  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return date.toLocaleTimeString(undefined, options);
  };


  // SLOT  (9-11, 11-2, 2-4)
 
  const getSlot = (dateStr) => {
    const hours = new Date(dateStr).getHours();
    if (hours >= 9 && hours < 11) return "slot1";
    if (hours >= 11 && hours < 14) return "slot2";
    if (hours >= 14 && hours < 16) return "slot3";
    return "other";
  };

 
  // filter visitor on name,email as well slots

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSlot =
      selectedSlot === "all" ? true : getSlot(v.scheduledAt) === selectedSlot;

    return matchesSearch && matchesSlot;
  });

  const totalEntries = filteredVisitors.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
          {/* Sidebar */}
          <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />
    
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">

            <Topbar />
     

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Visitors</h1>

          <div className="bg-white shadow rounded-lg p-4 space-y-4 ">

            {/* SEARCH + SLOT FILTER + TOTAL ENTRIES */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              {/* Left side: Search + Slot Filter */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Search Input */}
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

                {/* Slot Dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="slotFilter" className="font-semibold text-teal-700">
                    Filter by Slot:
                  </label>

                  <select
                    id="slotFilter"
                    value={selectedSlot}
                    onChange={(e) => {
                      setSelectedSlot(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-teal-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="all">All Slots</option>
                    <option value="slot1">Slot 1 (9 AM – 11 AM)</option>
                    <option value="slot2">Slot 2 (11 AM – 2 PM)</option>
                    <option value="slot3">Slot 3 (2 PM – 4 PM)</option>
                  </select>
                </div>
              </div>

              {/* Right side: Total Entries */}
              <div className="text-sm text-teal-700 font-semibold border border-teal-200 rounded px-3 py-3 bg-teal-50">
                Total entries: {totalEntries}
              </div>

            </div>


            {/* TABLE SECTION */}
            {totalEntries === 0 ? (
              <p className="text-gray-600">No visitors found.</p>
            ) : (
              <div className="overflow-x-auto">

                <table className="min-w-full bg-white rounded-lg border border-gray-200">
                  <thead className="bg-teal-500 text-white rounded-t-lg">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Email</th>
                      <th className="px-6 py-3 text-left font-semibold">Phone</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Time</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedVisitors.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 text-black font-medium">{v.name}</td>

                        <td className="px-6 py-3 text-teal-600 underline hover:text-teal-800 cursor-pointer">
                          {v.email}
                        </td>

                        <td className="px-6 py-3 text-black">{v.phone}</td>

                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs capitalize ${v.status === "approved"
                              ? "bg-teal-600"
                              : v.status === "pending"
                                ? "bg-teal-500"
                                : "bg-teal-600"
                              }`}
                          >
                            {v.status}
                          </span>
                        </td>

                        <td className="px-6 py-3 text-black">{formatDate(v.scheduledAt)}</td>
                        <td className="px-6 py-3 text-black">{formatTime(v.scheduledAt)}</td>

                        {/* ACTIONS */}
                        <td className="px-6 py-3 flex items-center gap-2">

                          {/* VIEW */}
                          <button
                            className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition "
                            onClick={() => setViewModal({ open: true, visitor: v })}
                          >
                            <FaEye size={16} />
                          </button>

                          {/* EDIT DROPDOWN */}
                          <div className="relative">
                            <button
                              className="p-2 rounded-full hover:bg-blue-100  transition cursor-pointer "
                              onClick={() =>
                                setStatusDropdown(
                                  statusDropdown === `edit-${v._id}` ? null : `edit-${v._id}`
                                )
                              }
                            >
                              <FaEdit size={16} />
                            </button>

                            {statusDropdown === `edit-${v._id}` && (
                              <div className="absolute top-full mt-1 right-0 w-36 bg-white border rounded shadow z-10">

                                {/* Approve */}
                                <button
                                  className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-teal-100 transition cursor-pointer
        ${v.status === "approved" ? "bg-teal-200 font-semibold" : ""}
      `}
                                  onClick={() => handleAction(v, "approve")}
                                >
                                  Approve
                                </button>

                                {/* Reject */}
                                <button
                                  className={`block w-full px-4 py-2 text-left hover:bg-red-100 transition cursor-pointer
        ${v.status === "rejected" ? "bg-red-200 font-semibold" : ""}
      `}
                                  onClick={() => handleAction(v, "reject")}
                                >
                                  Reject
                                </button>

                              </div>
                            )}

                          </div>

                          {/* DELETE */}
                          <button
                            className="p-2 rounded-full hover:bg-red-100 text-gray-700 transition cursor-pointer"
                            onClick={() => handleAction(v, "delete")}
                          >
                            <FaTrash size={16} />
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* PAGINATION */}
                <div className="flex justify-between items-center gap-2 mt-4">

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
            )}
          </div>
        </div>

        {/* VIEW MODAL */}
        {viewModal.open && viewModal.visitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  bg-opacity-90">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4">

              <h3 className="text-lg font-bold mb-2">Visitor Details</h3>

              <div className="grid grid-cols-2 gap-4">


                {/* Photo */}
                <div className="col-span-2 flex justify-center">
                  {viewModal.visitor.photo ? (
                    <div className="w-32 h-32 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100">
                      <img src={`https://visit-1-ren0.onrender.com/${viewModal.visitor.photo}`}
                           alt={viewModal.visitor.name}
                           className="w-full h-full object-cover object-center"
                      />

                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full border">
                      No Photo
                    </div>
                  )}
                </div>


                {/* Name */}
                <div>
                  <label className="font-semibold">Name</label>
                  <input
                    type="text"
                    value={viewModal.visitor.name}
                    readOnly
                    className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-semibold">Email</label>
                  <input
                    type="text"
                    value={viewModal.visitor.email}
                    readOnly
                    className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-semibold">Phone</label>
                  <input
                    type="text"
                    value={viewModal.visitor.phone}
                    readOnly
                    className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="font-semibold">Date</label>
                  <input
                    type="text"
                    value={formatDate(viewModal.visitor.scheduledAt)}
                    readOnly
                    className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="font-semibold">Time</label>
                  <input
                    type="text"
                    value={formatTime(viewModal.visitor.scheduledAt)}
                    readOnly
                    className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="font-semibold">Status</label>
                  <input
                    type="text"
                    value={viewModal.visitor.status}
                    readOnly
                    className={`mt-1 w-full border border-gray-800 rounded px-2 py-1 bg-gray-100 font-bold ${viewModal.visitor.status === "approved"
                        ? "text-black"
                        : viewModal.visitor.status === "pending"
                          ? "text-black"
                          : "text-black"
                      }`}
                  />
                </div>


              </div>

              {/* Purpose */}
              <div>
                <label className="font-semibold block mb-1">Purpose</label>
                <div className="w-full border rounded px-2 py-1 bg-gray-100">
                  {viewModal.visitor.purpose}
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setViewModal({ open: false, visitor: null })}
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}


      </div>
    </div>
  );
}



