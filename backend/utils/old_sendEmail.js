const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const formattedAttachments = attachments
      .filter(att => att.content)
      .map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content)
          ? att.content.toString("base64")
          : att.content,
      }));

    await resend.emails.send({
      from: "Visitor Pass <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments: formattedAttachments,
    });

    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.error("Resend Email Error:", err);
    throw err;
  }
};

module.exports = sendEmail;
