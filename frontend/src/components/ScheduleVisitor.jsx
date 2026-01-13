import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEmployee from "../components/EmployeeSidebar";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import Topbar from "./Topbar.jsx";
import emailjs from "@emailjs/browser";

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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "employee") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1️⃣ Call backend (NO FormData)
      const res = await api.post("/employee/schedule-visitor", form);

      const qrBase64 = res.data.qrBase64;
      if (!qrBase64) {
        alert("QR code missing from backend");
        return;
      }

      // 2️⃣ Send email directly (NO preview)
      if (form.email) {
        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          {
            to_name: form.name,
            to_email: form.email,
            purpose: form.purpose,
            scheduledAt: new Date(form.scheduledAt).toLocaleString(),
            qr: qrBase64, // ✅ Base64 QR image
          },
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        );
      }

      alert("Visitor scheduled and email sent successfully!");

      // 3️⃣ Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        purpose: "",
        scheduledAt: "",
      });

    } catch (err) {
      console.error("Error scheduling visitor:", err);
      alert(err.response?.data?.msg || "Error scheduling visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SidebarEmployee className="w-full md:w-64 flex-shrink-0" />

      <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
        <Topbar />

        <div className="flex-1 flex justify-center items-start p-4">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-lg mt-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Schedule Visitor
            </h1>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-3 w-full rounded-lg"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-3 w-full rounded-lg"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border p-3 w-full rounded-lg"
              />

              <input
                type="text"
                placeholder="Purpose of Visit"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="border p-3 w-full rounded-lg"
              />

              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm({ ...form, scheduledAt: e.target.value })
                }
                className="border p-3 w-full rounded-lg"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full mt-6 py-3 rounded-lg font-semibold text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {loading ? "Scheduling..." : "Schedule Visitor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
