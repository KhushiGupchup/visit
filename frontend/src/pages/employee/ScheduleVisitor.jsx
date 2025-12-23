import { useState } from "react";
import SidebarEmployee from "../../components/SidebarEmployee";
import api from "../../utils/api.js";
import QRCodeGenerator from "../../components/QRCodeGenerator.jsx";

export default function ScheduleVisitor() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    scheduledAt: "",
  });
  const [photo, setPhoto] = useState(null);
  const [qrData, setQrData] = useState("");

  const handleSubmit = async () => {
    const fd = new FormData();
    Object.keys(form).forEach((k) => fd.append(k, form[k]));
    if (photo) fd.append("photo", photo);

    try {
      const res = await api.post("/employee/schedule-visitor", fd);
      alert("Visitor scheduled. QR generated & email sent.");
      setQrData(JSON.stringify(res.data.qrData));
    } catch (err) {
      alert(err.response?.data?.msg || "Error scheduling visitor");
    }
  };

  return (
    <div className="flex">
      <SidebarEmployee />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Schedule Visitor</h1>

        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="Purpose"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        />
        <input
          type="datetime-local"
          className="border p-2 mb-2 w-full rounded"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
        />
        <input
          type="file"
          className="mb-3 w-full"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Schedule Visitor
        </button>

        {qrData && (
          <div className="mt-6">
            <h2 className="font-bold mb-2">Generated QR Code:</h2>
            <QRCodeGenerator value={qrData} />
          </div>
        )}
      </div>
    </div>
  );
}
