const emailjs = require("@emailjs/nodejs");

const sendEmail = async (toEmail, templateParams = {}, attachments = []) => {
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,   // Your EmailJS service ID
      process.env.EMAILJS_TEMPLATE_ID,  // Your EmailJS template ID
      {
        ...templateParams,
        to_email: toEmail,
        attachments, // array of files in base64
      },
      process.env.EMAILJS_PRIVATE_KEY   // Your EmailJS private key
    );
    console.log("Email sent to:", toEmail);
  } catch (err) {
    console.error("EmailJS send error:", err);
    throw err;
  }
};

module.exports = sendEmail;
