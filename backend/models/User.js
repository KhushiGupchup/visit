const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    empId: { type: Number, unique: true }, // optional auto-generated
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "employee", "security"],
      default: "employee",
    },
    department: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
