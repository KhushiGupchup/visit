const nodemailer = require("nodemailer");

const sendEmail = (to, subject, html, attachments = []) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail(
      {
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
        attachments,
      },
      (error, info) => {
        if (error) {
          console.log("Email Error:", error.message);
          return reject(error);
        }
        console.log("Email sent to:", to);
        resolve(info);
      }
    );
  });
};

module.exports = sendEmail;
