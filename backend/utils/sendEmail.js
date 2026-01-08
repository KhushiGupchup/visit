const emailjs = require("@emailjs/nodejs");
require("dotenv").config(); // Make sure .env variables are loaded

const sendEmail = async (toEmail, templateParams = {}, attachments = []) => {
  try {
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
      throw new Error("EmailJS environment variables missing!");
    }

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,   // Service ID
      process.env.EMAILJS_TEMPLATE_ID,  // Template ID
      {
        ...templateParams,
        to_email: toEmail,
        attachments, // [{ name: "file.png", data: base64 }]
      },
      process.env.EMAILJS_PUBLIC_KEY    // <-- Use PUBLIC key here, NOT private key
    );

    console.log("Email sent to:", toEmail);
  } catch (err) {
    console.error("EmailJS send error:", err);
    throw err;
  }
};

module.exports = sendEmail;
