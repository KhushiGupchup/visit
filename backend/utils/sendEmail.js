const { SMTPClient } = require("emailjs");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    // Configure SMTP client
    const client = new SMTPClient({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465, // default 465 for SSL
      ssl: true, // true for port 465, false for 587
      // tls: true, // uncomment if using port 587
    });

    // Prepare message with attachments
    const message = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      attachment: [
        { data: html, alternative: true }, // HTML body
        ...attachments.map(file => ({
          name: file.filename,
          data: file.content,
          headers: file.cid ? { "Content-ID": `<${file.cid}>` } : undefined,
        })),
      ],
    };

    // sendAsync is available in emailjs@3.x
    await client.sendAsync(message);

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
