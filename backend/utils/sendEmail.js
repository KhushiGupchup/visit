const nodemailer = require("nodemailer");

// Create transporter once
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,                // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT) || 587, // MUST be 587
  secure: false,                               // false for STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,              // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,                 // avoids TLS issues on cloud
  },
});

// Verify SMTP connection on startup
transporter.verify()
  .then(() => console.log("✅ Gmail SMTP connected"))
  .catch(err => console.error("❌ Gmail SMTP connection failed:", err));

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
    console.error("❌ Email Error:", error); // full error for debugging
    throw error;
  }
};

module.exports = sendEmail;
