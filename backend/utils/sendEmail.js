const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      attachments, // <-- attachments array added
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email Error:", error.message);
  }
};

module.exports = sendEmail;
