// resendEmail.js
const { Resend } = require("resend");

// Initialize Resend with API key from env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML content
 * @param {Array} attachments - optional attachments
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await resend.emails.send({
      from: "My App <onboarding@resend.dev>", // sender
      to,
      subject,
      html,
      attachments: attachments.map(att => ({
        name: att.filename,
        data: att.content.toString("base64"),
      })),
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email Error from Resend:", error.message);
  }
};

module.exports = sendEmail;
