// utils/sendEmail.js
const emailjs = require("@emailjs/nodejs");
require("dotenv").config(); // Make sure .env is loaded locally, optional on Render

/**
 * Send email using EmailJS
 * @param {string} toEmail - Recipient email
 * @param {object} templateParams - Template parameters for EmailJS
 * @param {Array} attachments - Array of attachments [{ name: "file.png", data: base64 }]
 */
const sendEmail = async (toEmail, templateParams = {}, attachments = []) => {
  try {
    // Check that all required env variables exist
    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_TEMPLATE_ID ||
      !process.env.EMAILJS_PUBLIC_KEY
    ) {
      console.error(
        "❌ EmailJS Error: Missing environment variables. Make sure EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY are set!"
      );
      throw new Error(
        "EmailJS environment variables missing! Check Render dashboard."
      );
    }

    // Send email
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,    // Service ID
      process.env.EMAILJS_TEMPLATE_ID,   // Template ID
      {
        ...templateParams,
        to_email: toEmail,
        attachments, // Attachments in base64 [{ name: "file.png", data: base64 }]
      },
      process.env.EMAILJS_PUBLIC_KEY     // Public key (required)
    );

    console.log(`✅ Email sent to: ${toEmail}`);
  } catch (err) {
    console.error("❌ EmailJS send error:", err);
    throw err;
  }
};

module.exports = sendEmail;
