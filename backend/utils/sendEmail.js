const email = require("emailjs");

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const server = email.server.connect({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.EMAIL_HOST,
      ssl: true, // change to tls: true if using port 587
    });

    // Prepare attachments for EmailJS
    const emailAttachments = [
      { data: html, alternative: true }, // HTML body
      ...attachments.map(file => {
        // file can have { filename, content, cid }
        const attachment = {};
        if (file.filename) attachment.name = file.filename;
        if (file.content) attachment.data = file.content;
        if (file.cid) attachment.cid = file.cid;
        return attachment;
      }),
    ];

    // EmailJS uses callback, so wrap in Promise for async/await
    await new Promise((resolve, reject) => {
      server.send(
        {
          from: process.env.FROM_EMAIL,
          to,
          subject,
          attachment: emailAttachments,
        },
        (err, message) => {
          if (err) reject(err);
          else resolve(message);
        }
      );
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
