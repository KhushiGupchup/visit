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
                              src={`https://visit-1-ren0.onrender.com/uploads/${v.photo}`}
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
                src={`https://visit-1-ren0.onrender.com/uploads/${visit.photo}`}
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


