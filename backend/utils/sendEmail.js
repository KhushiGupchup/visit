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
 *        Each attachment: { name: string, content: Buffer, type?: string }
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await resend.emails.send({
      from: "My App <onboarding@resend.dev>", // sender
      to,
      subject,
      html,
      attachments: attachments
        .filter(att => att.content) // skip undefined
        .map(att => ({
          name: att.name,                     // Correct key
          data: Buffer.isBuffer(att.content)  // Ensure it's a Buffer
            ? att.content.toString("base64")
            : att.content,                    // Already base64 string
          type: att.type || undefined,
        })),
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email Error from Resend:", error.message);
  }
};

module.exports = sendEmail;
