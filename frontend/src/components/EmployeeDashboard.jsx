import { useContext, useEffect, useState } from "react";
import SidebarEmployee from "../components/EmployeeSidebar";
import api from "../utils/api.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Topbar from "./Topbar.jsx";
import toast from "react-hot-toast";// to show toast notification

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);//get current user
  //set count to 0 first
  const [stats, setStats] = useState({
    todayVisits: 0,
    upcomingVisits: 0,
  });

  const [pendingVisitors, setPendingVisitors] = useState([]);//store data for pending visitor
  const [loading, setLoading] = useState(true);

  // Track action state which user is getting approve or reject
  const [actionState, setActionState] = useState({
    id: null,
    type: null, // "approve" | "reject"
  });

  // only employee can access the dashboard
  useEffect(() => {
    if (user === null) return;
    if (!user || user.role !== "employee") navigate("/login");
  }, [user, navigate]);

  // Fetch dashboard stats & pending visitors
  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // Dashboard stats call backend api to get today and upcoming visit
        const res = await api.get("/employee/dashboard");
        setStats({
          todayVisits: res.data.todayVisits || 0,
          upcomingVisits: res.data.upcomingVisits || 0,
        });

        // Pending visitor of the particular employee who is login
        const pendingRes = await api.get("/employee/my-visitors");
        const pending = pendingRes.data.filter((v) => v.status === "pending");//get only pending visitors
        setPendingVisitors(pending);
      } catch (err) {
        console.error("Error fetching dashboard:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  //handle approve or reject for visitor
  const handleAction = async (visitor, action) => {
    //for particular visitor the action
    setActionState({ id: visitor._id, type: action });

    try {
      if (action === "approve") {
        
        const res = await api.post(`/employee/approve-visitor/${visitor._id}`);//call approve visitor api
        toast.success(res.data.msg);//show the toast approval notifications
      } 
      else if (action === "reject") {
        const res = await api.patch(`/employee/reject-visitor/${visitor._id}`);// call reject visitor api
        toast.success(res.data.msg);//reject successful toast
      }

      // Refresh stats  after action is taken and get todays and upcoming visits
      const statsRes = await api.get("/employee/dashboard");
      setStats({
        todayVisits: statsRes.data.todayVisits || 0,
        upcomingVisits: statsRes.data.upcomingVisits || 0,
      });

      // Refresh pending visitors after the action is performed
      const pendingRes = await api.get("/employee/my-visitors");
      
      const pending = pendingRes.data.filter((v) => v.status === "pending");
      
      setPendingVisitors(pending);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error updating visitor");
    } finally {
      setActionState({ id: null, type: null });
    }
  };
//show date properly 
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
// show proper time and dont show second
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />

      {/* Main content */}
     <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
      


        <Topbar />

        {/* Dashboard Stats */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Todays visit for employee which are also approved*/}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold text-gray-700">Today's Visits</h3>
            <p className="text-4xl font-bold mt-4 text-teal-600">
              {loading ? "..." : stats.todayVisits}
            </p>
          </div>
          {/* Upcoming visit for employee which are also approved*/}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold text-gray-700">Upcoming Visits</h3>
            <p className="text-4xl font-bold mt-4 text-teal-600">
              {loading ? "..." : stats.upcomingVisits}
            </p>
          </div>
        </div>

        {/* Pending Visitor Cards to show the recent register by visitor  */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Visitors</h2>

          {loading ? (
            <p>Loading visitors...</p>
          ) : pendingVisitors.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 md:p-8 w-full md:max-w-[650px]  text-center">
              {/*in card if all approved no pending */}
              <h3 className="text-lg font-semibold text-gray-700">
                 No Pending Visitors
              </h3>
              <p className="text-gray-500 mt-2">
                You’re all caught up. New visitor requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* show the visitors in card with approve and reject button */}
              {pendingVisitors.map((v) => (
                <div
                  key={v._id}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-700">{v.name}</h3>
                  <p className="text-gray-600">{v.email}</p>
                  <p className="text-gray-600">{v.phone}</p>
                  <p className="text-gray-500 mt-1">
                    {formatDate(v.scheduledAt)} at {formatTime(v.scheduledAt)}
                  </p>
                  {/* approve  button in card */}

                  <div className="flex gap-2 mt-4">
                    <button
                      disabled={actionState.id === v._id}
                      onClick={() => handleAction(v, "approve")}
                      className="flex-1 bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 disabled:opacity-60"
                    >
                      {/* call approve api */}
                      {actionState.id === v._id &&
                      actionState.type === "approve"
                        ? "Approving..."
                        : "Approve"}
                    </button>
                    
                    {/* reject  button */}
                     {/* call the action api for reject */}

                    <button
                      disabled={actionState.id === v._id}
                      onClick={() => handleAction(v, "reject")}
                      className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-60"
                    >
                     
                      {actionState.id === v._id &&
                      actionState.type === "reject"
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



