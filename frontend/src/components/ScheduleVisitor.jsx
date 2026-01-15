import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEmployee from "../components/EmployeeSidebar";
import Topbar from "./Topbar.jsx";
import api from "../utils/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
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

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "employee") navigate("/login");
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.purpose || !form.scheduledAt) {
      setStatus("Please fill in all fields.");
      return;
    }

    // if (
    //   !process.env.REACT_APP_EMAILJS_SERVICE_ID ||
    //   !process.env.REACT_APP_EMAILJS_TEMPLATE_ID ||
    //   !process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    // ) {
    //   console.error("EmailJS environment variables are missing!");
    //   setStatus("Email service not configured. Contact admin.");
    //   return;
    // }

    setLoading(true);
    setStatus("");

    try {
      // Send form to backend to generate QR
      const res = await api.post("/employee/schedule-visitor", form);
      const qrBase64 = res.data.qr;

      if (form.email && qrBase64) {
        const templateParams = {
          to_name: form.name,
          email: form.email,
          purpose: form.purpose,
          scheduledAt: form.scheduledAt,
          qr: qrBase64,
        };

        try {
          await emailjs.send(
            "service_rfost09",
            "template_hptua9m",
            templateParams,
            "Kr_Xjtes6GaipRqxB"
          );
          setStatus("Visitor Pass Sent Successfully ");
        } catch (emailError) {
          console.error("EmailJS error:", emailError);
          setStatus("Failed to send email ");
        }
      }

      // Reset form only if backend succeeded
      setForm({
        name: "",
        email: "",
        phone: "",
        purpose: "",
        scheduledAt: "",
      });
    } catch (err) {
      console.error("Error scheduling visitor:", err);
      setStatus("Error scheduling visitor. Try again.");
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
          </div>
        </div>
      </div>
    </div>
  );
}


