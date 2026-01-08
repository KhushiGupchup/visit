const emailjs = require("@emailjs/nodejs");

const sendEmail = async (toEmail, templateParams = {}, attachments = []) => {
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: toEmail,
        attachments, // [{ name: "file.png", data: base64 }]
      },
      process.env.EMAILJS_PRIVATE_KEY
    );
    console.log("Email sent to:", toEmail);
  } catch (err) {
    console.error("EmailJS send error:", err);
    throw err;
  }
};

module.exports = sendEmail; 
