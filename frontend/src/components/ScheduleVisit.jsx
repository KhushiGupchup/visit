import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarVisitor from "./VisitorSidebar";
import Topbar from "./Topbar";
import { AuthContext } from "../context/AuthContext.jsx";
import logoVisio from "../assets/logo_new.png";

export default function ScheduleVisit() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    visitingTo: "",
    description: "",
    slot: "",
    date: "",
    photo: null,
  });

  const [preview, setPreview] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) navigate("/login");
  }, [navigate, user]);

  // Auto-fill email from user
  useEffect(() => {
    if (user) {
      setFormData((p) => ({
        ...p,
        email: user.email || "",
      }));
    }
  }, [user]);

  // Fetch available slots when visitingTo or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      const { visitingTo, date } = formData;

      if (!visitingTo || !date) {
        setSlots([]);
        setFormData((p) => ({ ...p, slot: "" }));
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/visitor/available-slots/${visitingTo}/${date}`
        );
        const availableSlots = res.data.availableSlots || [];
        setSlots(availableSlots);
        setFormData((p) => ({ ...p, slot: "" }));
      } catch (err) {
        console.error("Error fetching slots:", err);
        setSlots([]);
        setFormData((p) => ({ ...p, slot: "" }));
      }
    };

    fetchSlots();
  }, [formData.visitingTo, formData.date]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setFormData((p) => ({ ...p, photo: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const Label = ({ htmlFor, children, required }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.visitingTo || isNaN(Number(formData.visitingTo))) {
      return alert("Enter valid Employee ID.");
    }
    if (!formData.date) return alert("Select visit date.");
    if (!formData.slot) return alert("Select a time slot.");

    setLoading(true);
    try {
      // Convert slot string to scheduled Date object
      const [time, ampm] = formData.slot.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const [year, month, day] = formData.date.split("-").map(Number);
      const scheduledAt = new Date(year, month - 1, day, hours, minutes);

      // Map slot to backend key
      const slotMap = {
        "09:00 AM": "slot1",
        "10:00 AM": "slot1",
        "11:00 AM": "slot2",
        "12:00 PM": "slot2",
        "02:00 PM": "slot3",
        "03:00 PM": "slot3",
      };
      const slotKey = slotMap[formData.slot] || "slot1";

      // Prepare FormData
      const data = new FormData();
      data.append("hostEmpId", Number(formData.visitingTo));
      data.append("purpose", formData.description);
      data.append("scheduledAt", scheduledAt.toISOString());
      data.append("slot", slotKey);
      data.append("name", formData.name);       // ✅ Include name
      data.append("phone", formData.phone);     // ✅ Include phone
      if (formData.photo) data.append("photo", formData.photo);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/visitor/schedule-visit",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.msg || "Visit scheduled successfully");
      navigate("/visitor/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error scheduling visit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SidebarVisitor />
      <div className="flex-1 pt-[144px] md:pt-20 md:ml-64 flex flex-col overflow-auto">
        <Topbar />

        <main className=" flex justify-center px-4 py-4 overflow-auto ">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 space-y-4"
          >
            <div className="flex flex-col items-start">
              <img src={logoVisio} alt="Visio Logo" className="h-8 md:h-16 w-auto" />
              <h2 className="text-xl md:text-2xl font-bold border-b-2 border-teal-300 pb-1">
                Schedule a Visit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

              {/* LEFT SIDE */}
              <div className="space-y-2">
                <div>
                  <Label htmlFor="email" required>Email</Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm w-full cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label htmlFor="name" required>Name</Label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" required>Phone</Label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="visitingTo" required>Visiting To (Employee ID)</Label>
                  <input
                    id="visitingTo"
                    name="visitingTo"
                    type="text"
                    value={formData.visitingTo}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="description" required>Reason for Visit</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full resize-none"
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col justify-start items-center space-y-5">

                {/* PHOTO */}
                <div className="flex flex-col items-center w-full max-w-xs">
                  <Label htmlFor="photo-upload">Upload Photo (Optional)</Label>
                  <div className="mt-2 flex flex-col items-center space-y-2">
                    <div className="h-28 w-28 md:h-32 md:w-32 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
                      {preview ? <img src={preview} className="h-full w-full object-cover" /> : "No Photo"}
                    </div>
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer bg-teal-600 text-white rounded-md px-4 py-1.5 text-sm hover:bg-teal-700"
                    >
                      Choose
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </div>
                </div>

                {/* DATE */}
                <div className="w-full max-w-xs">
                  <Label htmlFor="date" required>Select Visit Date</Label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full"
                  />
                </div>

                {/* SLOT */}
                <div className="w-full max-w-xs">
                  <Label htmlFor="slot" required>Select Slot</Label>
                  <select
                    id="slot"
                    name="slot"
                    value={formData.slot}
                    onChange={(e) => setFormData((p) => ({ ...p, slot: e.target.value }))}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full"
                  >
                    <option value="" disabled>
                      {slots.length ? "Choose a Time Slot" : "Enter employee ID and date"}
                    </option>
                    {slots.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-teal-600 text-white font-bold py-3 rounded-lg w-full md:w-64 hover:bg-teal-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Scheduling..." : "Schedule Visit"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
