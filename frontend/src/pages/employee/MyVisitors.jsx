import { useEffect, useState } from "react";
import SidebarEmployee from "../../components/SidebarEmployee";
import api from "../../utils/api.js";

export default function MyVisitors() {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchVisitors = async () => {
        try {
            const res = await api.get("/employee/my-visitors");
            setVisitors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);

    const handleApprove = async (visitorId) => {
        setLoading(true);
        try {
            await api.post(`/employee/approve-visitor/${visitorId}`);
            alert("Visitor approved! QR and pass sent.");
            fetchVisitors(); // Refresh list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || "Error approving visitor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            <SidebarEmployee />
            <div className="flex-1 p-6 bg-gray-50 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">My Visitors</h1>

                {visitors.length === 0 ? (
                    <p>No visitors found.</p>
                ) : (
                    <table className="min-w-full bg-white shadow rounded">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Phone</th>
                                <th className="px-4 py-2">Purpose</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Host</th> {/* new column */}
                                <th className="px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.map((v) => (
                                <tr key={v._id} className="border-t">
                                    <td className="px-4 py-2">{v.name}</td>
                                    <td className="px-4 py-2">{v.email}</td>
                                    <td className="px-4 py-2">{v.phone}</td>
                                    <td className="px-4 py-2">{v.purpose}</td>
                                    <td className="px-4 py-2">{v.status}</td>
                                    <td className="px-4 py-2">{v.hostName} ({v.hostEmpId})</td> {/* show host */}
                                    <td className="px-4 py-2">
                                        {v.status === "pending" ? (
                                            <button
                                                disabled={loading}
                                                onClick={() => handleApprove(v._id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
                                            >
                                                {loading ? "Approving..." : "Approve"}
                                            </button>
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </div>
        </div>
    );
}
