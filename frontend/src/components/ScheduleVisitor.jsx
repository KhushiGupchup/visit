import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEmployee from "../components/EmployeeSidebar";
import api from "../utils/api.js";
import QRCodeGenerator from "../components/QRCodeGenerator.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import Topbar from "./Topbar.jsx";

export default function ScheduleVisitor() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    scheduledAt: "",
  });
  const [photo, setPhoto] = useState(null);
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false); // loading state

  useEffect(() => {
    if (user === null) return;
    if (!user || user.role !== "employee") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    setLoading(true); // start loading
    const fd = new FormData();
    Object.keys(form).forEach((k) => fd.append(k, form[k]));
    if (photo) fd.append("photo", photo);

    try {
      const res = await api.post("/employee/schedule-visitor", fd);
      alert("Visitor scheduled successfully. QR emailed.");
      setQrData(JSON.stringify(res.data.qrData));

      // Clear form & photo
      setForm({
        name: "",
        email: "",
        phone: "",
        purpose: "",
        scheduledAt: "",
      });
      setPhoto(null);
    } catch (err) {
      alert(err.response?.data?.msg || "Error scheduling visitor");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">

        <Topbar />

        <div className="flex-1 flex justify-center items-start p-4">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-lg mt-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
              Schedule Visitor
            </h1>

            {/* FORM FIELDS */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="text"
                placeholder="Purpose of Visit"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm({ ...form, scheduledAt: e.target.value })
                }
                className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />

              
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              } bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold mt-6 transition`}
            >
              {loading ? "Scheduling..." : "Schedule Visitor"}
            </button>

            {/* QR SECTION */}
            {qrData && (
              <div className="mt-8 text-center border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Generated QR Code
                </h2>
                <div className="flex justify-center">
                  <QRCodeGenerator value={qrData} size={200} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
