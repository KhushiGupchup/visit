const PDFDocument = require("pdfkit");

const generatePDF = (visitor, qrBase64) => {
  return new Promise((resolve, reject) => {
    try {
      if (!visitor) return reject(new Error("Visitor data is required"));

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

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
        .text(`Name: ${visitor.name || "-"}`)
        .text(`Phone: ${visitor.phone || "-"}`)
        .text(`Purpose: ${visitor.purpose || "-"}`);

      doc.moveDown(1);

      // Host details
      doc
        .fontSize(14)
        .text("Host Details", { underline: true });
      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Host Name: ${visitor.hostName || "-"}`)
        .text(
          `Scheduled At: ${
            visitor.scheduledAt
              ? new Date(visitor.scheduledAt).toLocaleString()
              : "-"
          }`
        );

      doc.moveDown(2);

      // QR code
      if (qrBase64) {
        const qrBuffer = Buffer.from(
          qrBase64.replace(/^data:image\/png;base64,/, ""),
          "base64"
        );

        const qrX = (doc.page.width - 150) / 2;
        doc.image(qrBuffer, qrX, doc.y, { width: 150 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePDF };
