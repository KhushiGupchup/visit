const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generatePDF(visitor, qrBase64, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    let stream;

    if (outputPath) {
      // Save to file
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
    } else {
      // Generate in memory
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    }

    // Title
    doc
      .fontSize(24)
      .fillColor("#008080")
      .text("Visitor Pass", { align: "center", underline: true });
    doc.moveDown(1.5);

    // Visitor details
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

    // Host details
    doc
      .fontSize(14)
      .fillColor("#000")
      .text("Host Details", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Host Name: ${visitor.hostName}`)
      .text(`Scheduled At: ${new Date(visitor.scheduledAt).toLocaleString()}`);
    doc.moveDown(2);

    // QR code
    const qrBuffer = Buffer.from(qrBase64.replace(/^data:image\/png;base64,/, ""), "base64"); 
    const qrX = (doc.page.width - 150) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: 150 });
    doc.moveDown(2);

    doc.end();

    if (outputPath) {
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);
    }
  });
}

module.exports = { generatePDF };
