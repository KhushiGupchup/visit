const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate a visitor PDF
 * @param {Object} visitor - visitor object
 * @param {string} qrBase64 - QR code base64 string
 * @param {string} [outputPath] - optional file path to save PDF, otherwise returns Buffer
 * @returns {Promise<string|Buffer>} - path or buffer
 */
async function generatePDF(visitor, qrBase64, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    let buffers = [];
    if (!outputPath) {
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    } else {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);
    }

    // Header
    doc.fontSize(24).fillColor("#008080").text("Visitor Pass", { align: "center", underline: true });
    doc.moveDown(1.5);

    // Visitor Info
    doc.fillColor("#000").fontSize(14).text("Visitor Details", { underline: true }).moveDown(0.5);
    doc.fontSize(12).text(`Name: ${visitor.name}`).text(`Phone: ${visitor.phone}`).text(`Purpose: ${visitor.purpose}`).moveDown(1);

    // Host Info
    doc.fontSize(14).fillColor("#000").text("Host Details", { underline: true }).moveDown(0.5);
    doc.fontSize(12).text(`Host Name: ${visitor.hostName}`).text(`Scheduled At: ${new Date(visitor.scheduledAt).toLocaleString()}`).moveDown(2);

    // QR Code directly from Buffer
    const qrBuffer = Buffer.from(qrBase64.replace(/^data:image\/png;base64,/, ""), "base64");
    const qrX = (doc.page.width - 150) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: 150 });
    doc.moveDown(2);

    doc.end();
  });
}

module.exports = { generatePDF };
