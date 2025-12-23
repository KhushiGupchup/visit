import { useState } from "react";
import axios from "axios";

export default function VisitorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    visitingTo: "",
    photo: null,
  });

  const [preview, setPreview] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key]) data.append(key, formData[key]);
      }

      const res = await axios.post("http://localhost:5000/api/visitor/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.msg);

      setFormData({ name: "", email: "", phone: "", address: "", visitingTo: "", photo: null });
      setPreview("");
    } catch (err) {
      console.error(err);
      alert("Error registering visitor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" placeholder="Full Name" onChange={handleChange} value={formData.name} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
      <input type="text" name="phone" placeholder="Phone" onChange={handleChange} value={formData.phone} required />
      <textarea name="address" placeholder="Address" onChange={handleChange} value={formData.address} required />
      <input type="text" name="visitingTo" placeholder="Visiting To" onChange={handleChange} value={formData.visitingTo} required />

      <div>
        <label className="cursor-pointer bg-teal-400 px-4 py-2 rounded-lg text-white">
          {formData.photo ? "Change Photo" : "Choose Photo"}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>
        {preview && <img src={preview} className="h-24 w-24 mt-2 object-cover rounded-lg" />}
      </div>

      <button type="submit" className="bg-teal-400 py-2 px-4 rounded-lg text-white">Register Visitor</button>
    </form>
  );
}
