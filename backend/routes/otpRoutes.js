// otpRoutes.js
const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

const otpStore = {};

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  await sendEmail(email, "Your OTP Code", `<p>Your OTP is <strong>${otp}</strong>.</p>`);

  res.json({ message: "OTP sent successfully" });
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: "No OTP found" });
  if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  delete otpStore[email];
  res.json({ message: "OTP verified" });
});

module.exports = router;
