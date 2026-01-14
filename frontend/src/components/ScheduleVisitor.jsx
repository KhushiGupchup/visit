import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEmployee from "../components/EmployeeSidebar";
import Topbar from "./Topbar.jsx";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import emailjs from "@emailjs/browser";
import { QRCodeCanvas } from "qrcode.react";

export default function ScheduleVisitor() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const qrCanvasRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    scheduledAt: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "employee") navigate("/login");
  }, [user, navigate]);

  const qrDataString = `
    Name: ${form.name}
    Email: ${form.email}
    Phone: ${form.phone}
    Purpose: ${form.purpose}
    Scheduled At: ${form.scheduledAt}
  `;

  const handleSubmit = async () => {
    setLoading(true);
    setStatus("");

    try {
      // 1️⃣ Save visitor to backend
      await api.post("/employee/schedule-visitor", form);

      // 2️⃣ Get QR Base64 (frontend only)
      const qrBase64 = qrCanvasRef.current?.toDataURL("image/png");

      // 3️⃣ Send Email via EmailJS
      if (form.email && qrBase64) {
        const templateParams = {
          to_name: form.name,
          email: form.email,
          purpose: form.purpose,
          scheduledAt: form.scheduledAt,
          qr: qrBase64, // use {{qr}} in EmailJS
        };

        await emailjs.send(
          "service_rfost09",
          "template_hptua9m",
          templateParams,
          "Kr_Xjtes6GaipRqxB"
        );
      }

      setStatus("Visitor scheduled & email sent ✅");

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        purpose: "",
        scheduledAt: "",
      });

    } catch (err) {
      console.error(err);
      setStatus("Error scheduling visitor ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SidebarEmployee />
      <div className="flex-1 flex flex-col pt-[144px] md:pt-20 md:ml-64">
        <Topbar />

        <div className="flex justify-center p-4">
          <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Schedule Visitor
            </h1>

            <div className="space-y-4">
              <input
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
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border p-3 w-full rounded-lg"
              />
              <input
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
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold mt-6"
            >
              {loading ? "Scheduling..." : "Schedule Visitor"}
            </button>

            {status && (
              <p className="mt-4 text-center font-medium">{status}</p>
            )}

            {/* 🔒 Hidden QR (frontend only) */}
            <div style={{ display: "none" }}>
              <QRCodeCanvas
                value={qrDataString}
                size={200}
                ref={qrCanvasRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
