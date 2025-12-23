import { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import SidebarEmployee from "./EmployeeSidebar";

export default function Reports() {
  const { user, logout } = useContext(AuthContext);

  const [data, setData] = useState({
    slotCounts: { slot1: 0, slot2: 0, slot3: 0 },
    hostStats: [],
    weekly: [],
    totals: { totalVisitors: 0, approved: 0, rejected: 0, pending: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data || {});
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [logout]);

  if (!user) return null;
  if (loading) return <p className="p-6 text-center">Loading reports...</p>;

  const weeklyData = data.weekly || [];
  const slotCounts = data.slotCounts || { slot1: 0, slot2: 0, slot3: 0 };
  const hostStats = data.hostStats || [];
  const totals = data.totals || { totalVisitors: 0, approved: 0, rejected: 0, pending: 0 };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />
      
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
              <Topbar />

        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Reports</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card title="Total Visitors" value={totals.totalVisitors} color="text-teal-600" />
            <Card title="Approved" value={totals.approved} color="text-green-600" />
            <Card title="Pending" value={totals.pending} color="text-yellow-600" />
            <Card title="Rejected" value={totals.rejected} color="text-red-600" />
          </div>

          {/* MAIN CHART GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px] lg:h-[500px]">
            {/* LEFT — Line Chart */}
            <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow flex flex-col">
              <h2 className="font-bold text-lg mb-4">Visitor Trend (Last 7 Days)</h2>
              <div className="flex-1">
                <Line
                  data={{
                    labels: weeklyData.map((x) => x.day),
                    datasets: [
                      {
                        label: "Visitors",
                        data: weeklyData.map((x) => x.count),
                        borderColor: "#0d9488",
                        backgroundColor: "rgba(13, 148, 136, 0.3)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN — two stacked charts */}
            <div className="flex flex-col gap-8 h-full">
              {/* Slot Report */}
              <div className="bg-white p-6 rounded-xl shadow flex flex-col flex-1">
                <h2 className="font-bold text-lg mb-4">Slot Booking Report</h2>
                <div className="flex-1">
                  <Bar
                    data={{
                      labels: ["Slot 1 (9–11)", "Slot 2 (11–2)", "Slot 3 (2–3)"],
                      datasets: [
                        {
                          label: "Visitors",
                          data: [slotCounts.slot1, slotCounts.slot2, slotCounts.slot3],
                          backgroundColor: ["#14b8a6", "#0ea5e9", "#f59e0b"],
                        },
                      ],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>

              {/* Host-wise Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow flex flex-col flex-1">
                <h2 className="font-bold text-lg mb-4">Top Employees (Visitors Received)</h2>
                <div className="flex-1">
                  {hostStats.length > 0 ? (
                    <Pie
                      data={{
                        labels: hostStats.map((h) => h.host),
                        datasets: [
                          {
                            data: hostStats.map((h) => h.count),
                            backgroundColor: hostStats.map(
                              (_, i) => `hsl(${(i * 360) / hostStats.length}, 70%, 50%)`
                            ),
                          },
                        ],
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center">No host data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Card component
function Card({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className={`text-4xl font-bold mt-4 ${color}`}>{value}</p>
    </div>
  );
}
