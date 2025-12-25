const PDFDocument = require("pdfkit");//to create pdf
const fs = require("fs");
const path = require("path");

//visitor details and qr image and where to store
async function generatePDF(visitor, qrBase64, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });//make document 
    const dir = path.dirname(outputPath);//save in given path
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });//if path not their then create

    const stream = fs.createWriteStream(outputPath);//send content to file
    doc.pipe(stream);

    // Title of document or pdf
    doc
      .fontSize(24)
      .fillColor("#008080")
      .text("Visitor Pass", { align: "center", underline: true });
    doc.moveDown(1.5);

    // show all Visitor Info 
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

    // Host Info and date ,time
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
    const tempQRPath = path.join(__dirname, `tmp_qr_${visitor._id}.png`);//temporary image file of qr
    fs.writeFileSync(tempQRPath, base64Data, "base64");//add it

    const qrX = (doc.page.width - 150) / 2; // center QR
    doc.image(tempQRPath, qrX, doc.y, { width: 150 });
    doc.moveDown(2);

   


    doc.end();// done all contents of files

    stream.on("finish", () => {
      fs.unlinkSync(tempQRPath);//remove temporary qr 
      resolve(outputPath);
    });

    stream.on("error", reject);
  });
}

module.exports = {generatePDF};

