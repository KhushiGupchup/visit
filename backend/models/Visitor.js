const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  email: { type: String,  unique: true },
 password: { type: String},
// hashed password
  name: String,
  phone: String,
  photo: String,
  purpose: String,
  hostEmpId: Number,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  qrData: String,
  passPdf: String,
  scheduledAt: Date,
  slot: { type: String, enum: ["slot1", "slot2", "slot3", "other"], default: "other" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Visitor", visitorSchema);
