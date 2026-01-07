const { SMTPClient } = require("emailjs");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const client = new SMTPClient({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      ssl: true, // use tls: true if port 587
    });

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

    // Send email as promise
    await client.sendAsync(message);

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
