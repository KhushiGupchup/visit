import { useState } from "react";
import api from "../utils/api.js";

export default function VisitorRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    hostId: "",
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.name || !form.purpose || !form.hostId) {
      alert("Name, Purpose, and Host Employee ID are required.");
      return;
    }

    if (isNaN(Number(form.hostId))) {
      alert("Host Employee ID must be a number.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => {
        // send hostId as hostEmpId to match backend
        fd.append(k === "hostId" ? "hostEmpId" : k, form[k]);
      });

      if (photo) fd.append("photo", photo);

      await api.post("/visitor/register", fd);
      alert("Visitor registration submitted. Host will review.");

      // Reset form
      setForm({ name: "", email: "", phone: "", purpose: "", hostId: "" });
      setPhoto(null);
    } catch (err) {
      alert(err.response?.data?.msg || "Error registering visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white shadow p-6 rounded max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Visitor Registration
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="border p-2 mb-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-2 w-full rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          className="border p-2 mb-2 w-full rounded"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Purpose"
          className="border p-2 mb-2 w-full rounded"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        />
        <input
          type="text"
          placeholder="Host Employee ID"
          className="border p-2 mb-2 w-full rounded"
          value={form.hostId}
          onChange={(e) => setForm({ ...form, hostId: e.target.value })}
        />

        <input
          type="file"
          className="mb-3 w-full"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 rounded mt-2 text-white ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
