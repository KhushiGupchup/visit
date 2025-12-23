import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api from "../utils/api.js";
import SidebarEmployee from "../components/EmployeeSidebar";

export default function SecurityDashboard() {
  const [visitorLogs, setVisitorLogs] = useState([]);

  useEffect(() => {
    async function fetchVisitorLogs() {
      try {
        const res = await api.get("/security/visitor-logs");
        setVisitorLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchVisitorLogs();
  }, []);

  const formatDateTime = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : "-";

  const getStatusText = (log) => {
    if (log.checkIn && !log.checkOut) return "Inside";
    if (log.checkOut) return "Exited";
    return "Not checked in";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SidebarEmployee />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
        <Topbar />

          <div className="p-9 flex-1 overflow-auto ">
          <h1 className="text-2xl font-bold mb-6">Security Dashboard</h1>

          {/* TABLE CONTAINER */}
          <div className="bg-white shadow rounded-lg overflow-hidden p-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-teal-600 text-white z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Check-In</th>
                    <th className="px-6 py-3 text-left">Check-Out</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {visitorLogs.length > 0 ? (
                    visitorLogs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {log.name || log.visitor?.name || "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          {log.email || log.visitor?.email || "-"}
                        </td>

                        <td className="px-6 py-4">
                          {formatDateTime(log.checkIn)}
                        </td>

                        <td className="px-6 py-4">
                          {formatDateTime(log.checkOut)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-teal-600 text-white">
                            {getStatusText(log)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-500"
                      >
                        No visitors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
