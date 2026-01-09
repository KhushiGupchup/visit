const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const filteredAttachments = attachments
      .filter(att => att.content)
      .map(att => ({
        name: att.name,
        type: att.type || undefined,
        data: Buffer.isBuffer(att.content)
          ? att.content.toString("base64")
          : att.content, // already base64
      }));

    await resend.emails.send({
      from: "Visitor Pass <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments: filteredAttachments,
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.log("Email Error from Resend:", err.message);
  }
};

module.exports = sendEmail;
