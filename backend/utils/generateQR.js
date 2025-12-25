const QRCode = require("qrcode");// qrcode library to create QR

//data-text which will go in qr or show that text as QR
async function generateQRBase64(data) {
  return await QRCode.toDataURL(data);//make QR 
}

module.exports = { generateQRBase64 };


