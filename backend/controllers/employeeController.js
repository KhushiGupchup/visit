const User = require("../models/User");
const Visitor = require("../models/Visitor");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { generateQRBase64 } = require("../utils/generateQR");
const { generatePDF } = require("../utils/generatePDF");
const { generateVisitorPassImage } = require("../utils/paasImage");
const sendEmail = require("../utils/sendEmail");

// Employee Dashboard 

exports.dashboard = async (req, res) => {
  try {
    const empId = Number(req.user.empId);

    // Date to get visitors
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Total visitors for particulat employee
    const myVisitors = await Visitor.countDocuments({
      hostEmpId: empId,
    });

    // Pending visitors of that employee
    const pendingVisitors = await Visitor.countDocuments({
      hostEmpId: empId,
      status: "pending",
    });

    // Today's approved visits
    const todayVisits = await Visitor.countDocuments({
      hostEmpId: empId,
      status: "approved",
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Upcoming approved visits (after today)
    const upcomingVisits = await Visitor.countDocuments({
      hostEmpId: empId,
      status: "approved",
      scheduledAt: { $gt: todayEnd },
    });

    res.json({
      myVisitors,
      pendingVisitors,
      todayVisits,
      upcomingVisits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error loading dashboard data" });
  }
};


//  Schedule Visitor by employee
exports.scheduleVisitor = async (req, res) => {
  try {
    const { name, email, phone, purpose, scheduledAt } = req.body;//get all fields
  
    const dateObj = new Date(scheduledAt);// to get easy way of js date

    // Determine slot from the date which is selected
    let slot = "other";
    const hours = dateObj.getHours();
    if (hours >= 9 && hours < 11) slot = "slot1";
    else if (hours >= 11 && hours < 14) slot = "slot2";
    else if (hours >= 14 && hours < 15) slot = "slot3";

    // Create visitor and status will be approved
    const visitor = await Visitor.create({
      name,
      email,
      phone,
      purpose,
      hostEmpId: Number(req.user.empId),
      scheduledAt: dateObj,
      status: "approved",
      slot
    });

    // Get host from empid
    const host = await User.findOne({ empId: req.user.empId });

    // Generate QR for scan
    const qrData = await generateQRBase64(JSON.stringify({ visitorId: visitor._id }));

        // Generate PDF for visitor
      
    const pdfDirectory = path.join(__dirname, "../uploads/pdfPass");
    
    //  Create the folder if it doesn't exist
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
    }
    
    //   the PDF file name (visitorId.pdf)
    const pdfFilePath = path.join(pdfDirectory, `${visitor._id}.pdf`);
    
    // Generate the PDF with visitor info and QR code
    await generatePDF(
      { ...visitor._doc, hostName: host?.name }, 
      qrData,                                   
      pdfFilePath                               
    );


    // Generate PNG pass
    const passImage = await generateVisitorPassImage({ ...visitor._doc, hostName: host?.name });

    // Update visitor with qr and pdf as schedule means already approved
    visitor.qrData = qrData;
    visitor.passPdf = pdfPath;
    await visitor.save();

    // Send email to visitor which is already approved
    if (email) {
      const qrBuffer = Buffer.from(qrData.split(",")[1], "base64");
      const emailHTML = `
        <div style="max-width:400px;margin:0 auto;font-family:sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#3b82f6;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold;">
            VPMS Visitor Pass
          </div>
          <div style="padding:16px;text-align:center;">
            <img src="cid:visitor_pass" alt="Visitor Pass" style="width:300px;height:auto;" />
          </div>
          <div style="background:#10b981;color:white;text-align:center;padding:12px;font-size:20px; font-weight:bold">
            Please show this pass at the entrance.
          </div>
        </div>
      `;
    //send all files
      await sendEmail(email, "Your VPMS Visitor Pass", emailHTML, [
        { filename: "VisitorPass.png", content: passImage, cid: "visitor_pass" },
        { filename: "VisitorPass.pdf", path: pdfPath },
        { filename: "VisitorQR.png", content: qrBuffer, cid: "visitor_qr" },
      ]);
    }

    res.json({ msg: "Visitor scheduled successfully!", visitor });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error scheduling visitor", error: err.message });
  }
};

// Get Employee Visitors 
exports.getMyVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ hostEmpId: Number(req.user.empId) }).sort({ scheduledAt: -1 });//latest visitor
     // get all data and hostname from empid
    const formatted = await Promise.all(visitors.map(async (v) => {
      const host = await User.findOne({ empId: v.hostEmpId });
      return {
        _id: v._id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        purpose: v.purpose,
        status: v.status,
        scheduledAt: v.scheduledAt,
        slot: v.slot,
        qrData: v.qrData,
        hostName: host?.name || "Unknown",
        hostEmpId: v.hostEmpId,
        photo: v.photo
  ? `https://visit-1-ren0.onrender.com/${v.photo}`
  : null,

      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching your visitors" });
  }
};


//  Change Password after using random password once 
exports.changePassword = async (req, res) => {
  try {
    const { empId, newPassword, confirmPassword } = req.body;//get all req field

    if (!empId || !newPassword || !confirmPassword)
      return res.status(400).json({ msg: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ msg: "Passwords do not match" });

    const user = await User.findOne({ empId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

//  Delete Visitor 
exports.deleteVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ msg: "Visitor not found" });

    if (visitor.hostEmpId !== Number(req.user.empId) && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to delete this visitor" });
    }

    await Visitor.deleteOne({ _id: visitorId });
    res.json({ msg: "Visitor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting visitor", error: err.message });
  }
};

// Approve Visitor and send the qr and pdfpass to them

exports.approveVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findById(visitorId);

    if (!visitor)
      return res.status(404).json({ msg: "Visitor not found" });

    const host = await User.findOne({ empId: visitor.hostEmpId });

    const alreadyApproved = visitor.status === "approved";

    // Always approve
    visitor.status = "approved";

    // Generate QR if missing
    if (!visitor.qrData) {
      visitor.qrData = await generateQRBase64(
        JSON.stringify({ visitorId })
      );
    }

    /* GENERATE PDF PASS  */
    const pdfDir = path.join(__dirname, "../uploads/pdfPass");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const pdfPath = path.join(pdfDir, `${visitorId}.pdf`);
    await generatePDF(
      { ...visitor._doc, hostName: host?.name },
      visitor.qrData,
      pdfPath
    );
    visitor.passPdf = pdfPath;

    /*  GENERATE PNG PASS  */
    const passImage = await generateVisitorPassImage({
      ...visitor._doc,
      hostName: host?.name,
    });

    const imageDir = path.join(__dirname, "../uploads/passImages");
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

    const imagePath = path.join(imageDir, `${visitorId}.png`);
    fs.writeFileSync(imagePath, passImage);
    visitor.passImage = imagePath;

    await visitor.save();

    /*  SEND EMAIL  */
    if (visitor.email) {
      const qrBuffer = Buffer.from(
        visitor.qrData.split(",")[1],
        "base64"
      );

      const emailHTML = `
        <div style="max-width:400px;margin:0 auto;font-family:sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#3b82f6;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold;">
            VPMS Visitor Pass
          </div>
          <div style="padding:16px;text-align:center;">
            <img src="cid:visitor_pass" alt="Visitor Pass" style="width:300px;height:auto;" />
          </div>
          <div style="background:#10b981;color:white;text-align:center;padding:12px;font-size:20px;font-weight:bold">
            Please show this pass at the entrance.
          </div>
        </div>
      `;

      await sendEmail(
        visitor.email,
        "Your VPMS Visitor Pass",
        emailHTML,
        [
          { filename: "VisitorPass.png", content: passImage, cid: "visitor_pass" },
          { filename: "VisitorPass.pdf", path: pdfPath },
          { filename: "VisitorQR.png", content: qrBuffer, cid: "visitor_qr" },
        ]
      );
    }

    return res.json({
      msg: alreadyApproved
        ? "Visitor is already approved"
        : "Visitor approved successfully",
      visitor,
    });

  } catch (err) {
    console.error("Approve Visitor Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



//  Reject Visitor if dont want 
exports.rejectVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findById(visitorId);

    if (!visitor)
      return res.status(404).json({ msg: "Visitor not found" });

    // Permission check
    if (visitor.hostEmpId !== Number(req.user.empId) && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to reject this visitor" });
    }

    let responseMsg = "";

    if (visitor.status === "rejected") {
      responseMsg = "Visitor is already rejected";
    } else if (visitor.status === "approved") {
      responseMsg = "Visitor was approved earlier, now marked as rejected";
    } else {
      responseMsg = "Visitor rejected successfully";
    }

    visitor.status = "rejected";
    await visitor.save();

    return res.json({ msg: responseMsg, visitor });

  } catch (err) {
    console.error("Reject Visitor Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// add visitor by employee
exports.addVisitorByEmployee = async (req, res) => {
  try {
    // Employee scheduling a visitor
    const employee = req.user; // logged-in employee from JWT
    if (!employee || employee.role !== "employee") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const allowedSlots = ["slot1", "slot2", "slot3", "other"];
    const slot = allowedSlots.includes(req.body.slot) ? req.body.slot : "other";

    const visitorData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      hostEmpId: employee.empId,      // employee's ID
      hostName: employee.name,        // employee's name
      purpose: req.body.purpose,
      scheduledAt: req.body.scheduledAt,
      slot,
      status: "pending",
      photo: req.file ? req.file.filename : null,
    };

    const newVisit = await Visitor.create(visitorData);

   

    res.status(201).json({ msg: "Visitor scheduled successfully", data: newVisit });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};







