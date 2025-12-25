const QRCode = require("qrcode");


async function generateQRBase64(data) {
  return await QRCode.toDataURL(data);
}

module.exports = { generateQRBase64 };

