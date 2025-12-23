import { useEffect, useState } from "react";
import SidebarEmployee from "../../components/SidebarEmployee";
import StatsCard from "../../components/StatsCard";
import api from "../../utils/api.js";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({ myVisitors: 0, pendingVisitors: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/employee/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex">
      <SidebarEmployee />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
        <div className="grid grid-cols-2 gap-6">
          <StatsCard title="My Visitors" value={stats.myVisitors} />
          <StatsCard title="Pending Visitors" value={stats.pendingVisitors} />
        </div>
      </div>
    </div>
  );
}
