const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const filteredAttachments = attachments
      .filter(att => att.content) // remove attachments without content
      .map(att => ({
        name: att.name,
        type: att.type || undefined,
        content: Buffer.isBuffer(att.content)
          ? att.content.toString("base64") // convert Buffer to base64
          : att.content, // already base64
        cid: att.cid || undefined, // optional, for inline images
      }));

    await resend.emails.send({
      from: "Visitor Pass <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments: filteredAttachments, // must use 'content'
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.log("Email Error from Resend:", err.message);
  }
};

module.exports = sendEmail;
