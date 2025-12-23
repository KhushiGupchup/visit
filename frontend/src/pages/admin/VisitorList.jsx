import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import api from "../../utils/api.js";

export default function VisitorList() {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const res = await api.get("/admin/visitors");
        setVisitors(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchVisitors();
  }, []);

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">All Visitors</h1>
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Host</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v._id} className="border-t">
                <td className="px-4 py-2">{v.name}</td>
                <td className="px-4 py-2">{v.email}</td>
                <td className="px-4 py-2">{v.phone}</td>
                <td className="px-4 py-2">{v.host}</td>
                <td className="px-4 py-2">{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
