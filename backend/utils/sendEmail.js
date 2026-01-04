const nodemailer = require("nodemailer");//library to send email

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, 
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      attachments, //  attachments array added
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email Error:", error.message);
  }
};

module.exports = sendEmail;


