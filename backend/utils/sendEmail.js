const emailjs = require("@emailjs/nodejs");

// Load environment variables locally (optional, mainly for dev)
require("dotenv").config();

const sendEmail = async (toEmail, templateParams = {}, attachments = []) => {
  try {
    // Check required env variables
    const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } = process.env;
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error(
        `EmailJS environment variables missing! 
Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in your Render dashboard.`
      );
    }

    // Send email
    await emailjs.send(
      EMAILJS_SERVICE_ID,     // Service ID
      EMAILJS_TEMPLATE_ID,    // Template ID
      {
        ...templateParams,
        to_email: toEmail,
        attachments, // [{ name: "file.png", data: base64 }]
      },
      EMAILJS_PUBLIC_KEY      // Public Key
    );

    console.log("Email sent to:", toEmail);

  } catch (err) {
    console.error("EmailJS send error:", err.message || err);
    throw err;
  }
};

module.exports = sendEmail;
