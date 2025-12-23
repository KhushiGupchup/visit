const Visitor = require("../models/Visitor");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Append text fields
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("visitingTo", formData.visitingTo);

      // Append file if exists
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const res = await axios.post(
        "http://localhost:5000/api/visitor/add",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.msg);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        visitingTo: "",
        photo: null,
      });
      setPreview("");
    } catch (err) {
      console.error(err);
      alert("Error registering visitor");
    }
  };
// Add Visitor and send email with QR code visitorController.js
exports.addVisitor = async (req, res) => {
  try {
    // 1️⃣ Save visitor data
    const visitorData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      visitingTo: req.body.visitingTo,
      photo: req.file ? req.file.filename : null,
    };

    const newVisitor = await Visitor.create(visitorData);

    // 2️⃣ Generate QR code as Data URL
    const qrData = `VisitorID:${newVisitor._id}`;
    const qrImage = await QRCode.toDataURL(qrData);

    // 3️⃣ Optional: Generate PDF badge
    const pdfPath = path.join(__dirname, "../uploads", `${newVisitor._id}-badge.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(20).text("Visitor Pass", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${newVisitor.name}`);
    doc.text(`Visiting To: ${newVisitor.visitingTo}`);
    doc.text(`Phone: ${newVisitor.phone}`);
    doc.moveDown();
    // Embed QR code
    const qrBase64 = qrImage.replace(/^data:image\/png;base64,/, "");
    doc.image(Buffer.from(qrBase64, "base64"), { fit: [150, 150], align: "center" });
    doc.end();

    // 4️⃣ Send Email with QR code
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // store in .env
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newVisitor.email,
      subject: "Your Visitor Pass",
      html: `
        <h3>Hello ${newVisitor.name},</h3>
        <p>You are registered as a visitor to ${newVisitor.visitingTo}.</p>
        <p>Please find your QR code below:</p>
        <img src="${qrImage}" />
        <p>Or download your PDF badge attached.</p>
      `,
      attachments: [
        { filename: "visitor-badge.pdf", path: pdfPath },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      msg: "Visitor added successfully, email sent!",
      data: newVisitor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};
