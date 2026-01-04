const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailData = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      attachments,
    };

    // Wrap sendMail in a Promise
    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          reject(err);
        } else {
          resolve(info);
        }
      });
    });

    console.log("Email sent to:", to);
    return info; 
  } catch (error) {
    console.log("Email Error:", error.message);
    throw error; 
  }
};

module.exports = sendEmail;
