const mongoose = require("mongoose");

const checkLogSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
  pass: String,
  checkIn: Date,
  checkOut: Date,
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Security
});

module.exports = mongoose.model("CheckLog", checkLogSchema);
