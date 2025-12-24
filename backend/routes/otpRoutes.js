const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

const otpStore = {};
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;//take email first
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    //  6-digit OTP be randomly generated
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store that randomly generated OTP for 5 minutes
    otpStore[email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000
    };
//send otp to taken email
    await sendEmail(
        email,
        "Your OTP Code",
        `<p>Your OTP is <strong>${otp}</strong>.</p>`
    );
    res.json({ message: "OTP sent successfully" });
});
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];//get otp for that email

 if (!record) {
    return res.status(400).json({ message: "No OTP found" });
}

if (Date.now() > record.expires) {
    return res.status(400).json({ message: "OTP is already expired" });
}

if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP please check again" });
}

  delete otpStore[email];//after getting correct otp delete it from store so that new otp will get store on new req
  res.json({ message: "OTP verified" });
});

module.exports = router;
