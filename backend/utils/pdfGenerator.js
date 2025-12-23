const PDFDocument = require("pdfkit");
const fs = require("fs");

async function generatenewPDF(visitor, qrData, pdfPath) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(pdfPath));

  // Header
  doc.fillColor("#3b82f6")
     .fontSize(20)
     .text("VPMS Visitor Pass", { align: "center" });

  doc.moveDown();

  // Visitor Info
  doc.fillColor("#000")
     .fontSize(14)
     .text(`Name: ${visitor.name}`)
     .text(`Host: ${visitor.hostName}`)
     .text(`Status: ${visitor.status}`)
     .text(`Scheduled At: ${new Date(visitor.scheduledAt).toLocaleString()}`);

  doc.moveDown();

  // QR code
  const qrBuffer = Buffer.from(qrData.split(",")[1], "base64");
  doc.image(qrBuffer, { width: 200, align: "center" });

  // Footer
  doc.fillColor("#10b981")
     .fontSize(12)
     .text("Please show this pass at the entrance", { align: "center", valign: "bottom" });

  doc.end();
}

module.exports = { generatenewPDF };
