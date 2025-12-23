import { useEffect, useState } from "react";
import SidebarSecurity from "../../components/SidebarSecurity";
import api from "../../utils/api.js";

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString(); // formats as "MM/DD/YYYY, HH:MM:SS"
  };

  return (
    <div className="flex">
      <SidebarSecurity />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Security Dashboard</h1>
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Check-In</th>
              <th className="px-4 py-2">Check-Out</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {visitorLogs.map((log) => {
              const isInside = log.checkIn && !log.checkOut;
              return (
                <tr
                  key={log._id}
                  className={`border-t ${isInside ? "bg-green-100" : ""}`}
                >
                  <td className="px-4 py-2">{log.name}</td>
                  <td className="px-4 py-2">{log.email}</td>
                  <td className="px-4 py-2">{formatDateTime(log.checkIn)}</td>
                  <td className="px-4 py-2">{formatDateTime(log.checkOut)}</td>
                  <td className="px-4 py-2">
                    {isInside ? "Inside" : log.checkOut ? "Exited" : "Not checked in"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
