const PDFDocument = require("pdfkit");

async function generatePDF(visitor, qrBase64) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc
        .fontSize(24)
        .fillColor("#008080")
        .text("Visitor Pass", { align: "center", underline: true });
      doc.moveDown(1.5);

      // Visitor Info
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

      // Host Info
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

      // QR Code (direct from base64, NO temp file)
      const qrBuffer = Buffer.from(
        qrBase64.replace(/^data:image\/png;base64,/, ""),
        "base64"
      );

      const qrX = (doc.page.width - 150) / 2;
      doc.image(qrBuffer, qrX, doc.y, { width: 150 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePDF };
