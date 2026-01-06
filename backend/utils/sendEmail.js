const nodemailer = require("nodemailer");

// 1️⃣ Create transporter once
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // e.g., smtp.gmail.com
  port: Number(process.env.EMAIL_PORT) || 587, // 587 recommended
  secure: false,                          // must be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,         // App password if Gmail
  },
  tls: {
    rejectUnauthorized: false,            // avoids cloud TLS issues
  },
});

// 2️⃣ Verify SMTP connection on startup
transporter.verify()
  .then(() => console.log("✅ SMTP server ready"))
  .catch(err => console.error("❌ SMTP connection failed:", err));

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments,
    });

    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("❌ Email Error:", error); // full error object
    throw error; // optional: rethrow for your API to handle
  }
};

module.exports = sendEmail;
