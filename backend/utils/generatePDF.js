const PDFDocument = require("pdfkit");

async function generatePDF(visitor, qrBase64) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      // Collect the PDF chunks into a buffer
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ===== Header =====
      doc
        .fontSize(24)
        .fillColor("#008080")
        .text("Visitor Pass", { align: "center", underline: true });
      doc.moveDown(1.5);

      // ===== Visitor Info =====
      doc
        .fillColor("#000")
        .fontSize(14)
        .text("Visitor Details", { underline: true });
      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Name: ${visitor.name}`)
        .text(`Phone: ${visitor.phone || "N/A"}`)
        .text(`Purpose: ${visitor.purpose || "N/A"}`);
      doc.moveDown(1);

      // ===== Host Info =====
      doc
        .fontSize(14)
        .text("Host Details", { underline: true });
      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Host Name: ${visitor.hostName || "N/A"}`)
        .text(`Scheduled At: ${new Date(visitor.scheduledAt).toLocaleString()}`);
      doc.moveDown(2);

      // ===== QR Code =====
      const qrBuffer = Buffer.from(qrBase64.replace(/^data:image\/png;base64,/, ""), "base64");
      const qrX = (doc.page.width - 150) / 2;
      doc.image(qrBuffer, qrX, doc.y, { width: 150 });
      doc.moveDown(2);

      // ===== Finalize PDF =====
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePDF };
