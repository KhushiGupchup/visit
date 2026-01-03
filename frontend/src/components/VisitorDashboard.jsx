import { useState, useEffect, useContext } from "react";
import { FaCheckCircle, FaClock, FaTimesCircle, FaEye } from "react-icons/fa";
import Topbar from "../components/Topbar";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import SidebarEmployee from "./EmployeeSidebar";

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
    visits.forEach((v) => {
      if (v.hostEmpId) namesMap[v.hostEmpId] = v.hostName || "Unknown";
    });
    setHostNames(namesMap);
  }, [visits]);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  const totalVisits = visits.length;
  const approved = visits.filter((v) => v.status === "approved").length;
  const pending = visits.filter((v) => v.status === "pending").length;
  const rejected = visits.filter((v) => v.status === "rejected").length;

  const upcomingVisit = visits
    .filter((v) => new Date(v.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
           {/* Sidebar */}
           <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />
     
           {/* Main content */}
           <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
             <Topbar />

        {/* Dashboard Content */}
        <div className="pt-24 px-4 md:px-8 space-y-8">
          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Visitor Dashboard
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Approved" value={approved} icon={<FaCheckCircle />} />
            <SummaryCard title="Pending" value={pending} icon={<FaClock />} />
            <SummaryCard title="Rejected" value={rejected} icon={<FaTimesCircle />} />
            <SummaryCard title="Total Visits" value={totalVisits} icon={<FaCheckCircle />} />
          </div>

          {/* Upcoming Visit */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Visit</h2>
            <UpcomingVisitCard
              visit={upcomingVisit || null}
              hostName={upcomingVisit ? hostNames[upcomingVisit.hostEmpId] : null}
            />
          </div>

          {/* Visit History Table */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">My Visit History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-teal-500 text-white text-xs sm:text-sm">
                  <tr>
                    <th className="px-3 py-3 text-left">Photo</th>
                    <th className="px-3 py-3 text-left">Date</th>
                    <th className="px-3 py-3 text-left">Time</th>
                    <th className="px-3 py-3 text-left">Host</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-3 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.length ? (
                    visits.map((v) => (
                      <tr key={v._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-3 py-3">
                          {v.photo ? (
                            <img
                              src={v.photo || "data:image/jpeg;base64,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"}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                              alt="visitor"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                              No Photo
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">{formatDate(v.scheduledAt)}</td>
                        <td className="px-3 py-3">{formatTime(v.scheduledAt)}</td>
                        <td className="px-3 py-3">{hostNames[v.hostEmpId]}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              v.status === "approved"
                                ? "bg-teal-500 text-white"
                                : v.status === "pending"
                                ? "bg-teal-500 text-white"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
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
        <VisitModal
          visit={selectedVisit}
          hostName={hostNames[selectedVisit.hostEmpId]}
          close={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

/* Summary Card */
function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl px-6 py-8 shadow-sm hover:shadow-md transition flex flex-col items-start justify-between">
      <p className="text-2xl sm:text-xl font-bold text-gray-500">{title}</p>
      <div className="flex items-center justify-between w-full">
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{value}</p>
        <div className="text-3xl sm:text-4xl text-teal-600 bg-teal-50 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* Upcoming Visit Card */
function UpcomingVisitCard({ visit, hostName }) {
  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  if (!visit) {
    return (
      <div className="bg-gray-100 p-4 rounded-xl w-full max-w-md flex items-center justify-center text-gray-500 font-semibold">
        No upcoming visits
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-xl w-full max-w-md">
      <div className="relative flex items-center">
        <div className="w-8 h-8 bg-gray-100 rounded-full border-teal-800 border-r-2 absolute left-[-16px] z-30"></div>
        <div className="flex flex-1 bg-white border border-gray-500 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-center p-6 relative z-10">
            {visit.qrData ? (
              <img
                src={visit.qrData}
                alt="QR"
                className="w-24 h-24 border rounded-lg object-contain"
              />
            ) : (
              <div className="w-24 h-24 border rounded-lg flex items-center justify-center text-gray-400 text-sm">
                No QR
              </div>
            )}
          </div>
          <div className="w-2px border-l-4 border-dashed border-gray-300 my-4"></div>
          <div className="flex-1 p-4 flex flex-col justify-center gap-1 text-sm relative z-10">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Visit Scheduled</h3>
            <div className="flex gap-1">
              <strong className="text-gray-600">Date:</strong>{" "}
              <span>{formatDate(visit.scheduledAt)}</span>
            </div>
            <div className="flex gap-1">
              <strong className="text-gray-600">Time:</strong>{" "}
              <span>{formatTime(visit.scheduledAt)}</span>
            </div>
            <div className="flex gap-1">
              <strong className="text-gray-600">Host:</strong> <span>{hostName}</span>
            </div>
            {/* <p className="truncate">
              <strong className="text-gray-600">Purpose:</strong> {visit.purpose}
            </p> */}
            <span
              className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase w-fit ${
                visit.status === "approved"
                  ? "bg-teal-500 text-white"
                  : visit.status === "pending"
                  ? "bg-teal-500 text-white"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {visit.status}
            </span>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-100 border-l-2 border-teal-800 rounded-full absolute right-[-16px] z-30"></div>
      </div>
    </div>
  );
}

/* Visit Modal */
function VisitModal({ visit, hostName, close }) {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-[90%] sm:w-2xl max-h-[90vh] overflow-auto">
        {/* Close Button – Top Right */}
        <button
          onClick={close}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold mb-4 text-left">Visit Details</h3>

        {/* Visitor Photo */}
        <div className="flex justify-center mb-6">
          {visit.photo ? (
            <div className="w-32 h-32 rounded-full border overflow-hidden bg-gray-100">
              <img
                src={visit.photo || "data:image/jpeg;base64,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"}
                alt={visit.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full border">
              No Photo
            </div>
          )}
        </div>

        {/* Grid Layout for Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-semibold">Name</label>
            <input
              type="text"
              value={visit.name}
              readOnly
              className="mt-1 w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-semibold">Phone</label>
            <input
              type="text"
              value={visit.phone}
              readOnly
              className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Host</label>
            <input
              type="text"
              value={hostName}
              readOnly
              className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Date</label>
            <input
              type="text"
              value={formatDate(visit.scheduledAt)}
              readOnly
              className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Time</label>
            <input
              type="text"
              value={formatTime(visit.scheduledAt)}
              readOnly
              className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Status</label>
            <input
              type="text"
              value={visit.status}
              readOnly
              className={`mt-1 w-full border border-gray-800 rounded px-2 py-1 font-bold bg-gray-100 ${
                visit.status === "approved"
                  ? "text-black"
                  : visit.status === "pending"
                  ? "text-black"
                  : "text-red-500"
              }`}
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold">Purpose</label>
            <div className="mt-1 w-full border rounded px-2 py-2 bg-gray-100">
              {visit.purpose}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




