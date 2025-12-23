import { useState, useEffect, useContext } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye
} from "react-icons/fa";

import SidebarVisitor from "../components/VisitorSidebar";
import Topbar from "../components/Topbar";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function VisitorDashboard() {
  const { user } = useContext(AuthContext);
  const [visits, setVisits] = useState([]);
  const [hostNames, setHostNames] = useState({});
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMyVisits();
  }, [user]);

  const fetchMyVisits = async () => {
    try {
      const res = await api.get("/visitor/my-visits");
      setVisits(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const namesMap = {};
    visits.forEach(v => {
      if (v.hostEmpId) namesMap[v.hostEmpId] = v.hostName || "Unknown";
    });
    setHostNames(namesMap);
  }, [visits]);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
      : "-";

  const formatTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
      : "-";

  const totalVisits = visits.length;
  const approved = visits.filter(v => v.status === "approved").length;
  const pending = visits.filter(v => v.status === "pending").length;
  const rejected = visits.filter(v => v.status === "rejected").length;

  const upcomingVisit = visits
    .filter(v => new Date(v.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block md:w-64 md:fixed md:top-0 md:left-0 md:h-screen">
        <SidebarVisitor />
      </div>

      <div className="flex-1 md:ml-64 flex flex-col overflow-auto">
        <Topbar />

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">

          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Visitor Dashboard
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <SummaryCard title="Approved" value={approved} icon={<FaCheckCircle />} />
            <SummaryCard title="Pending" value={pending} icon={<FaClock />} />
            <SummaryCard title="Rejected" value={rejected} icon={<FaTimesCircle />} />
            <SummaryCard title="Total Visits" value={totalVisits} icon={<FaCheckCircle />} />
          </div>

          {/* Upcoming Visit */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Upcoming Visit
            </h2>

            {upcomingVisit ? (
              <div className="max-w-lg bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row overflow-hidden">

                {/* Date */}
                <div className="bg-teal-600 text-white px-6 py-4 sm:px-8 sm:py-0 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0">
                  <span className="text-sm uppercase">
                    {new Date(upcomingVisit.scheduledAt).toLocaleString("default", { month: "short" })}
                  </span>
                  <span className="text-3xl font-bold">
                    {new Date(upcomingVisit.scheduledAt).getDate()}
                  </span>
                  <span className="text-xs">
                    {new Date(upcomingVisit.scheduledAt).getFullYear()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
                  <div className="space-y-1 text-sm sm:text-md text-gray-600">
                    <h3 className="font-semibold text-gray-800 text-base">
                      Visit Scheduled
                    </h3>
                    <p><strong>Time:</strong> {formatTime(upcomingVisit.scheduledAt)}</p>
                    <p><strong>Host:</strong> {hostNames[upcomingVisit.hostEmpId]}</p>
                    <p className="truncate max-w-xs">
                      <strong>Purpose:</strong> {upcomingVisit.purpose}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full capitalize ${upcomingVisit.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : upcomingVisit.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {upcomingVisit.status}
                    </span>

                  </div>

                  {upcomingVisit.qrData && (
                    <img
                      src={upcomingVisit.qrData}
                      alt="Visitor QR"
                      className="w-20 h-20 border rounded-lg self-start sm:self-center"
                    />
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">You have no upcoming visits.</p>
            )}
          </div>

          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold mb-4">
              My Visit History
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-teal-500 text-white text-xs sm:text-sm">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left">Photo</th>
                    <th className="px-3 sm:px-6 py-3 text-left">Date</th>
                    <th className="px-3 sm:px-6 py-3 text-left">Time</th>
                    <th className="px-3 sm:px-6 py-3 text-left">Host</th>
                    <th className="px-3 sm:px-6 py-3 text-left">Purpose</th>
                    <th className="px-3 sm:px-6 py-3 text-left">Status</th>
                    <th className="px-3 sm:px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {visits.length ? (
                    visits.map(v => (
                      <tr key={v._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-3 sm:px-6 py-3">
                          {v.photo ? (
                            <img
                              src={`http://localhost:5000/uploads/${v.photo}`}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                              alt="visitor"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                              No Photo
                            </div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3">{formatDate(v.scheduledAt)}</td>
                        <td className="px-3 sm:px-6 py-3">{formatTime(v.scheduledAt)}</td>
                        <td className="px-3 sm:px-6 py-3">{hostNames[v.hostEmpId]}</td>
                        <td className="px-3 sm:px-6 py-3">{v.purpose}</td>
                        <td className="px-3 sm:px-6 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${v.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : v.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3">
                          <button
                            className="text-teal-600 hover:text-teal-800 transition"
                            onClick={() => {
                              setSelectedVisit(v);
                              setModalOpen(true);
                            }}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-gray-500">
                        No visits found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-[90%] sm:w-96 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">Visit Details</h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Name:</strong> {selectedVisit.name}</p>
              <p><strong>Email:</strong> {selectedVisit.email}</p>
              <p><strong>Phone:</strong> {selectedVisit.phone}</p>
              <p><strong>Date:</strong> {formatDate(selectedVisit.scheduledAt)}</p>
              <p><strong>Time:</strong> {formatTime(selectedVisit.scheduledAt)}</p>
              <p><strong>Host:</strong> {hostNames[selectedVisit.hostEmpId]}</p>
              <p><strong>Purpose:</strong> {selectedVisit.purpose}</p>
              <p><strong>Status:</strong> {selectedVisit.status}</p>
            </div>

            {selectedVisit.photo && (
              <img
                src={`http://localhost:5000/uploads/${selectedVisit.photo}`}
                className="mt-4 w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border mx-auto"
                alt="visitor"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Summary Card (sm:px-6 sm:py-5 )*/
function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl px-6 py-8 shadow-sm hover:shadow-md transition flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
          {value}
        </p>
      </div>

      <div className="text-3xl sm:text-4xl text-teal-600 bg-teal-50 p-2 sm:p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
}
