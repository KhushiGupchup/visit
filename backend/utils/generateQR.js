const QRCode = require("qrcode");

/**
 * Generate QR code as base64 PNG
 * @param {string} data
 * @returns {Promise<string>} - "data:image/png;base64,..."
 */
async function generateQRBase64(data) {
  return await QRCode.toDataURL(data);
}

module.exports = { generateQRBase64 };
