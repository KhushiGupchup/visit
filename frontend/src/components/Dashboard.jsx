import { useContext, useEffect, useState } from "react";
import SidebarEmployee from "./EmployeeSidebar";
import Topbar from "./Topbar";
import VisitorTable from "./VisitorTable";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);//user data and logout
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalVisitors: 0,
    pendingVisitors: 0,
  });//set count at 0 first

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");//get token 
        if (!token) return;
        // call backend api and token 
        const res = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);//then add the count
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) logout();
      }
    }

    if (user) fetchStats();//take count 
  }, [user, logout]);

  if (!user) return null;

  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* Sidebar */}
        <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />
  
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
          <Topbar />
          
        {/* Stats */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Employee *}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">Total Employees</h3>
            <p className="text-4xl font-bold mt-4 text-blue-600">{stats.totalEmployees}</p>
          </div>
          
          {/* Total Visitors *}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">Total Visitors</h3>
            <p className="text-4xl font-bold mt-4 text-teal-600">{stats.totalVisitors}</p>
          </div>

           {/* Pending Visitors *}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-700">Pending Visitors</h3>
            <p className="text-4xl font-bold mt-4 text-yellow-500">{stats.pendingVisitors}</p>
          </div>
        </div>

        {/* Visitor Table */}
        <div className="p-6 flex-1 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Visitors</h2>
          <VisitorTable />
        </div>
      </div>
    </div>
  );
}

