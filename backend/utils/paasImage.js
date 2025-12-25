const sharp = require("sharp");//library to convert svg to png
const { generateQRBase64 } = require("./generateQR");


async function generateVisitorPassImage(visitor) {
  // Generate QR code which has visitor id
  const qrData = await generateQRBase64(JSON.stringify({ visitorId: visitor._id }));

  //  Create a simple SVG template for the visitor pass
  const svg = `
    <svg width="400" height="600">
      <rect width="400" height="600" fill="#fff" stroke="#ccc" rx="20" ry="20"/>
      
      <!-- Header -->
      <text x="50%" y="60" font-size="24" text-anchor="middle" fill="#3b82f6" font-family="sans-serif" font-weight="bold">
        VPMS Visitor Pass
      </text>

      <!-- Visitor Info -->
      <text x="20" y="120" font-size="16" fill="#000">Name: ${visitor.name}</text>
      <text x="20" y="150" font-size="16" fill="#000">Host: ${visitor.hostName}</text>
      <text x="20" y="180" font-size="16" fill="#000">Status: ${visitor.status}</text>
      <text x="20" y="210" font-size="16" fill="#000">Scheduled: ${new Date(visitor.scheduledAt).toLocaleString()}</text>

      <!-- QR Code -->
      <image x="100" y="250" width="200" height="200" href="data:image/png;base64,${qrData.split(",")[1]}"/>

      <!-- Footer -->
      <rect x="0" y="500" width="400" height="60" fill="#10b981"/>
      <text x="50%" y="540" font-size="14" text-anchor="middle" fill="white" font-family="sans-serif">
        Please show this pass at the entrance
      </text>
    </svg>
  `;

  //  conver the svg into png image and save it 
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return pngBuffer;//give the saved image
}

module.exports = { generateVisitorPassImage };

