import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import SidebarEmployee from "../components/EmployeeSidebar.jsx";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

const PAGE_SIZE = 8;

export default function MyVisitors() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState("all");
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [viewModal, setViewModal] = useState({ open: false, visitor: null });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee") navigate("/login");
  }, [user, navigate]);

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/employee/my-visitors");
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
      if (action === "approve") {
        await api.post(`/employee/approve-visitor/${visitor._id}`);
      } else if (action === "reject") {
        await api.post(`/employee/reject-visitor/${visitor._id}`);
      } else if (action === "delete") {
        if (!window.confirm("Are you sure you want to delete this visitor?")) return;
        await api.delete(`/employee/delete-visitor/${visitor._id}`);
      }
      fetchVisitors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error updating visitor");
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

  const getSlot = (scheduledAt) => {
    const hour = new Date(scheduledAt).getHours();
    if (hour >= 9 && hour < 11) return "slot1";
    if (hour >= 11 && hour < 14) return "slot2";
    if (hour >= 14 && hour < 16) return "slot3";
    return "other";
  };

  const filteredVisitors =
    selectedSlot === "all"
      ? visitors
      : visitors.filter((v) => getSlot(v.scheduledAt) === selectedSlot);

  const totalPages = Math.ceil(filteredVisitors.length / PAGE_SIZE);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block md:w-64 md:fixed md:top-0 md:left-0 md:h-screen">
        <SidebarEmployee />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-auto p-6">
        <Topbar/>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Visitors</h1>

        <div className="bg-white shadow rounded-lg p-4 space-y-4">
          {/* Filter */}
          <div className="flex flex-wrap items-center gap-4">
            <label htmlFor="slotFilter" className="font-semibold">Filter by Slot:</label>
            <select
              id="slotFilter"
              value={selectedSlot}
              onChange={(e) => {
                setSelectedSlot(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded px-3 py-1"
            >
              <option value="all">All Slots</option>
              <option value="slot1">Slot 1 (9 AM - 11 AM)</option>
              <option value="slot2">Slot 2 (11 AM - 2 PM)</option>
              <option value="slot3">Slot 3 (2 PM - 4 PM)</option>
              
            </select>
          </div>

          {filteredVisitors.length === 0 ? (
            <p className="text-gray-600">No visitors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVisitors.map((v) => (
                    <tr key={v._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{v.name}</td>
                      <td className="px-4 py-2">{v.email}</td>
                      <td className="px-4 py-2">{v.phone}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-white font-semibold text-sm capitalize ${
                          v.status === "approved"
                            ? "bg-green-600"
                            : v.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-600"
                        }`}>{v.status}</span>
                      </td>
                      <td className="px-4 py-2">{formatDate(v.scheduledAt)}</td>
                      <td className="px-4 py-2">{formatTime(v.scheduledAt)}</td>
                      <td className="px-4 py-2 relative">
                   <div className="flex items-center gap-3">
  {/* Edit Dropdown */}
  <div className="relative">
    <button
      className="p-2  hover:bg-blue-200 text-blue-600  transition flex items-center justify-center"
      onClick={() =>
        setStatusDropdown(
          statusDropdown === `edit-${v._id}` ? null : `edit-${v._id}`
        )
      }
      title="Edit / Change Status"
    >
      <FaEdit size={16} />
    </button>
    {statusDropdown === `edit-${v._id}` && (
      <div className="absolute top-full mt-1 right-0 w-36 bg-white border rounded shadow z-10">
        <button
          className={`block w-full px-4 py-2 text-left hover:bg-gray-100 transition ${
            v.status === "approved" ? "bg-green-100" : ""
          }`}
          onClick={() => handleAction(v, "approve")}
        >
          Approve
        </button>
        <button
          className={`block w-full px-4 py-2 text-left hover:bg-gray-100 transition ${
            v.status === "rejected" ? "bg-red-100" : ""
          }`}
          onClick={() => handleAction(v, "reject")}
        >
          Reject
        </button>
      </div>
    )}
  </div>

  {/* Delete */}
  <button
    className="p-2 hover:bg-red-200 text-red-600  transition flex items-center justify-center"
    onClick={() => handleAction(v, "delete")}
    title="Delete Visitor"
  >
    <FaTrash size={16} />
  </button>

  {/* Eye / View */}
  <button
    className="p-2  hover:bg-gray-200 text-gray-700  transition flex items-center justify-center"
    onClick={() => setViewModal({ open: true, visitor: v })}
    title="View Details"
  >
    <FaEye size={16} />
  </button>
</div>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {viewModal.open && viewModal.visitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4">
            <h3 className="text-lg font-bold mb-2">Visitor Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Name</label>
                <input
                  type="text"
                  value={viewModal.visitor.name}
                  readOnly
                  className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold">Email</label>
                <input
                  type="text"
                  value={viewModal.visitor.email}
                  readOnly
                  className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold">Phone</label>
                <input
                  type="text"
                  value={viewModal.visitor.phone}
                  readOnly
                  className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold">Date</label>
                <input
                  type="text"
                  value={formatDate(viewModal.visitor.scheduledAt)}
                  readOnly
                  className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="font-semibold">Time</label>
                <input
                  type="text"
                  value={formatTime(viewModal.visitor.scheduledAt)}
                  readOnly
                  className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
                />
              </div>
              <div className="mb-4">
  <label className="font-semibold block mb-1">Status</label>
  <span
    className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-sm capitalize ${
      viewModal.visitor.status === "approved"
        ? "bg-green-600"
        : viewModal.visitor.status === "pending"
        ? "bg-yellow-500"
        : "bg-red-600"
    }`}
  >
    {viewModal.visitor.status}
  </span>
</div>
              <div className="col-span-2">
                <label className="font-semibold">Purpose</label>
                <div className="mt-1 w-full border rounded px-2 py-1 bg-gray-100">
                  {viewModal.visitor.purpose}
                </div>
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
  );
}

{/* dn8zda4b */}