const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // avoids TLS handshake issues
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// ✅ Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY FAILED:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      attachments,
    });
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};

module.exports = sendEmail;
