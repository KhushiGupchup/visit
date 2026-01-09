const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generatePDF(visitor, qrBase64, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .fillColor("#008080")
      .text("Visitor Pass", { align: "center", underline: true });
    doc.moveDown(1.5);

    // Visitor Info Box
    doc
      .fillColor("#000")
      .fontSize(14)
      .text("Visitor Details", { underline: true });
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Name: ${visitor.name}`)
      .text(`Phone: ${visitor.phone}`)
      .text(`Purpose: ${visitor.purpose}`);
    doc.moveDown(1);

    // Host Info Box
    doc
      .fontSize(14)
      .fillColor("#000")
      .text("Host Details", { underline: true });
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Host Name: ${visitor.hostName}`)
      .text(
        `Scheduled At: ${new Date(visitor.scheduledAt).toLocaleString()}`
      );
    doc.moveDown(2);

    // QR Code
    const base64Data = qrBase64.replace(/^data:image\/png;base64,/, "");
    const tempQRPath = path.join(__dirname, `tmp_qr_${visitor._id}.png`);
    fs.writeFileSync(tempQRPath, base64Data, "base64");

    const qrX = (doc.page.width - 150) / 2; // center QR
    doc.image(tempQRPath, qrX, doc.y, { width: 150 });
    doc.moveDown(2);

   


    doc.end();

    stream.on("finish", () => {
      fs.unlinkSync(tempQRPath);
      resolve(outputPath);
    });

    stream.on("error", reject);
  });
}

module.exports = {generatePDF};
