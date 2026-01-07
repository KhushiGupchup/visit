const { SMTPClient } = require("emailjs");

const sendEmail = async (to, subject, html, attachments = []) => {
  const client = new SMTPClient({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    ssl: Number(process.env.EMAIL_PORT) === 465,
  });

  const message = {
    from: process.env.FROM_EMAIL || process.env.EMAIL_USER,
    to,
    subject,
    attachment: [
      { data: html, alternative: true },
      ...attachments.map(file => ({
        name: file.filename,
        data: file.content,
        headers: file.cid ? { "Content-ID": `<${file.cid}>` } : undefined,
      })),
    ],
  };

  try {
    await client.sendAsync(message);
    console.log(`Email sent successfully to: ${to}`);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};

module.exports = sendEmail;
