import { useEffect, useState, useContext } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import StatsCard from "../../components/StatsCard";
import api from "../../utils/api.js";
import { AuthContext } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalVisitors: 0,
    pendingVisitors: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <StatsCard title="Total Employees" value={stats.totalEmployees} />
          <StatsCard title="Total Visitors" value={stats.totalVisitors} />
          <StatsCard title="Pending Visitors" value={stats.pendingVisitors} />
        </div>
      </div>
    </div>
  );
}
