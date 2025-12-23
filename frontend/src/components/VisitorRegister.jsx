import { useState, useEffect } from "react";
import axios from "axios";
import NavbarComponent from "./Navbar_new";
import logoVisio from "../assets/logo_new.png";
import { useNavigate } from "react-router-dom";

export default function VisitorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    visitingTo: "",
    description: "",
    slot: "",
    date: "",
    photo: null
  });
  const [preview, setPreview] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available slots when visitingTo or date changes
  useEffect(() => {
    async function fetchSlots() {
      const { visitingTo, date } = formData;
      if (!visitingTo || !date) {
        setSlots([]);
        setFormData(p => ({ ...p, slot: "" }));
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/visitor/available-slots/${visitingTo}/${date}`);
        setSlots(res.data.availableSlots || []);
        setFormData(p => ({ ...p, slot: "" }));
      } catch {
        setSlots([]);
      }
    }
    fetchSlots();
  }, [formData.visitingTo, formData.date]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    setFormData(p => ({ ...p, photo: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const Label = ({ htmlFor, children, required }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.visitingTo || isNaN(Number(formData.visitingTo))) return alert("Enter valid Employee ID.");
    if (!formData.date) return alert("Select visit date.");
    if (!formData.slot) return alert("Select a time slot.");

    setLoading(true);

    try {
      // Convert slot string to scheduled time
      const [hoursStr, minutesPart] = formData.slot.split(/[: ]/);
      let hours = Number(hoursStr), minutes = Number(minutesPart), ampm = formData.slot.split(" ")[1];
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const [year, month, day] = formData.date.split("-").map(Number);
      const scheduledAt = new Date(year, month - 1, day, hours, minutes);

      // Map slot to slot1/2/3
      const slotMap = {
        "09:00 AM": "slot1",
        "10:00 AM": "slot1",
        "11:00 AM": "slot2",
        "12:00 PM": "slot2",
        "02:00 PM": "slot3",
        "03:00 PM": "slot3"
      };
      const slotKey = slotMap[formData.slot] || "slot1";

      // Prepare form data
      const data = new FormData();
      Object.entries({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        hostEmpId: Number(formData.visitingTo),
        purpose: formData.description,
        scheduledAt: scheduledAt.toISOString(),
        slot: slotKey
      }).forEach(([k, v]) => data.append(k, v));

      if (formData.photo) data.append("photo", formData.photo);

      const res = await axios.post("http://localhost:5000/api/visitor/add", data, { headers: { "Content-Type": "multipart/form-data" } });

      alert(res.data.msg || "Visitor registered successfully");
      setFormData({ name:"", email:"", phone:"", visitingTo:"", description:"", slot:"", date:"", photo:null });
      setPreview(""); 
      setSlots([]);
      navigate("/my-visitors");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error registering visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-teal-500 to-blue-500 text-gray-900">
      <NavbarComponent />

      <main className="flex-1 flex justify-center px-4 py-4 overflow-auto pt-24">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 space-y-4"
          style={{ minWidth: "300px" }}
        >
          {/* Header */}
          <div className="flex flex-col items-start">
            <img src={logoVisio} alt="Visio Logo" className="h-8 md:h-16 w-auto " />
            <h2 className="text-xl md:text-2xl font-bold border-b-2 border-teal-300 pb-1">
              Visitor Registration
            </h2>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left Side */}
            <div className="space-y-2">
              {["name","email","phone","visitingTo"].map((field,i) => (
                <div key={i}>
                  <Label htmlFor={field} required>
                    {field==="visitingTo"?"Visiting To (Employee ID)":field.charAt(0).toUpperCase()+field.slice(1)}
                  </Label>
                  <input id={field} name={field} type={field==="email"?"email":"text"} value={formData[field]} onChange={handleChange} required
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500"/>
                </div>
              ))}

              <div>
                <Label htmlFor="description" required>Reason for Visit</Label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Purpose of your visit" required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500 resize-none"/>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col justify-start items-center space-y-5">
              {/* Photo Upload */}
              <div className="flex flex-col items-center w-full max-w-xs">
                <Label htmlFor="photo-upload">Upload Photo (Optional)</Label>
                <div className="mt-2 flex flex-col items-center space-y-2">
                  <div className="h-28 w-28 md:h-32 md:w-32 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
                    {preview ? <img src={preview} className="h-full w-full object-cover"/> : "No Photo"}
                  </div>
                  <label htmlFor="photo-upload" className="cursor-pointer bg-teal-600 text-white rounded-md px-4 py-1.5 text-sm hover:bg-teal-700">Choose</label>
                  <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden"/>
                </div>
              </div>

              {/* Date */}
              <div className="w-full max-w-xs">
                <Label htmlFor="date" required>Select Visit Date</Label>
                <input id="date" type="date" name="date" min={new Date().toISOString().split("T")[0]} value={formData.date} onChange={handleChange} required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500"/>
              </div>

              {/* Slot */}
              <div className="w-full max-w-xs">
                <Label htmlFor="slot" required>Select Slot</Label>
                <select id="slot" name="slot" value={formData.slot} onChange={e=>setFormData(p=>({...p,slot:e.target.value}))} required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500">
                  <option value="" disabled>{slots.length ? "Choose a Time Slot" : "Enter employee ID and date to see slots"}</option>
                  {slots.map((slot,i)=><option key={i} value={slot}>{slot}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button type="submit" disabled={loading} className={`bg-teal-600 text-white font-bold py-3 rounded-lg w-full md:w-64 hover:bg-teal-700 ${loading?"opacity-50 cursor-not-allowed":""}`}>
              {loading?"Registering...":"Check In"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
