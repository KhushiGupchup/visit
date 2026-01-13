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
  const qrRef = useRef(); // for QR code canvas

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

  const qrDataString = () =>
    `Name: ${form.name}, Email: ${form.email}, Phone: ${form.phone}, Purpose: ${form.purpose}, Scheduled At: ${form.scheduledAt}`;

  const handleSubmit = async () => {
    setLoading(true);
    setStatus("");

    try {
      // 1️⃣ Save visitor in backend
      const res = await api.post("/employee/schedule-visitor", form);

      // 2️⃣ Generate QR code Base64
      const canvas = qrRef.current?.querySelector("canvas");
      let qrBase64 = "";
      if (canvas) qrBase64 = canvas.toDataURL("image/png");

      // 3️⃣ Send email via EmailJS
      if (form.email) {
        const templateParams = {
          to_name: form.name,
          email: form.email,
          purpose: form.purpose,
          scheduledAt: form.scheduledAt,
          qr: qrBase64, // <-- Base64 for {{qr}}
        };

        try {
          await emailjs.send(
            "service_rfost09",
            "template_hptua9m",
            templateParams,
            "Kr_Xjtes6GaipRqxB"
          );
          setStatus("Visitor scheduled and email sent ✅");
        } catch (emailErr) {
          console.error("EmailJS Error:", emailErr);
          setStatus("Visitor scheduled, but email failed ❌");
        }
      } else {
        setStatus("Visitor scheduled successfully ✅");
      }

      // Clear form
      setForm({ name: "", email: "", phone: "", purpose: "", scheduledAt: "" });

    } catch (err) {
      console.error("Error scheduling visitor:", err);
      setStatus(err.response?.data?.msg || "Error scheduling visitor ❌");
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left">
              Schedule Visitor
            </h1>

            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
              <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
              <input type="text" placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
              <input type="text" placeholder="Purpose of Visit" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>

            <button onClick={handleSubmit} disabled={loading} className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""} bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold mt-6 transition`}>
              {loading ? "Scheduling..." : "Schedule Visitor"}
            </button>

            {status && <p className="mt-4 text-center font-medium text-gray-700">{status}</p>}

            {/* Hidden QR code for email */}
            <div ref={qrRef} style={{ display: "none" }}>
              <QRCodeCanvas value={qrDataString()} size={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
