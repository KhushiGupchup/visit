const emailjs = require("@emailjs/nodejs");

// Initialize EmailJS client with public and private key
const client = emailjs.client.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const sendEmail = async (toEmail, templateParams = {}, attachments = []) => {
  try {
    const response = await client.messages.send({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      template_params: {
        ...templateParams,
        to_email: toEmail, // pass recipient
      },
      attachments: attachments.map(att => ({
        name: att.name,
        data: att.data, // base64 string
      })),
    });

    console.log("Email sent to:", toEmail, "Response:", response);
    return response;
  } catch (err) {
    console.error("EmailJS send error:", err);
    throw err;
  }
};

module.exports = sendEmail;
