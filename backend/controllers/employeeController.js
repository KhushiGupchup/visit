const User = require("../models/User");
const Visitor = require("../models/Visitor");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { generateQRBase64 } = require("../utils/generateQR");
const { generatePDF } = require("../utils/generatePDF");
const { generateVisitorPassImage } = require("../utils/paasImage");
const sendEmail = require("../utils/sendEmail");

// ===== Dashboard =====
// 
exports.dashboard = async (req, res) => {
  try {
    const empId = Number(req.user.empId);

    // Date boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Total visitors
    const myVisitors = await Visitor.countDocuments({
      hostEmpId: empId,
    });

    // Pending visitors
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


// ===== Schedule Visitor =====
exports.scheduleVisitor = async (req, res) => {
  try {
    const { name, email, phone, purpose, scheduledAt } = req.body;
    const dateObj = new Date(scheduledAt);

    // Determine slot
    let slot = "other";
    const hours = dateObj.getHours();
    if (hours >= 9 && hours < 11) slot = "slot1";
    else if (hours >= 11 && hours < 14) slot = "slot2";
    else if (hours >= 14 && hours < 15) slot = "slot3";

    // Create visitor
    const visitor = await Visitor.create({
      name,
      email,
      phone,
      purpose,
      hostEmpId: Number(req.user.empId),
      scheduledAt: dateObj,
      status: "approved",
      slot,
    });

    // Get host info
    const host = await User.findOne({ empId: req.user.empId });

    // --- Generate QR code ---
    const qrData = await generateQRBase64(JSON.stringify({ visitorId: visitor._id }));
    const qrBuffer = Buffer.from(qrData.split(",")[1], "base64");

    // --- Generate PDF & PNG in-memory ---
    const pdfBuffer = await generatePDF({ ...visitor._doc, hostName: host?.name }, qrData);
    const passImageBuffer = await generateVisitorPassImage({ ...visitor._doc, hostName: host?.name });

    // Convert pass image for inline display
    const passBase64 = passImageBuffer.toString("base64");
    const qrBase64 = qrBuffer.toString("base64");

    // Save visitor QR only (optional)
    visitor.qrData = qrData;
    visitor.passPdf = null;
    visitor.passImage = null;
    await visitor.save();

    // --- Send email if email exists ---
    if (email) {
      const emailHTML = `
        <div style="max-width:400px;margin:0 auto;font-family:sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#3b82f6;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold;">
            VPMS Visitor Pass
          </div>

          <div style="padding:16px;text-align:center;">
            <!-- Visitor Pass Image -->
            <img src="cid:visitor_pass" alt="Visitor Pass" style="width:300px;height:auto;" />
          </div>

          <div style="padding:16px;text-align:center;">
            <!-- QR Code Image -->
            <img src="cid:visitor_qr" alt="Visitor QR" style="width:150px;height:auto;" />
          </div>

          <div style="background:#10b981;color:white;text-align:center;padding:12px;font-size:20px;font-weight:bold">
            Please show this pass and QR at the entrance.
          </div>
        </div>
      `;

      await sendEmail(email, "Your VPMS Visitor Pass", emailHTML, [
        {
          name: "VisitorPass.pdf",
          type: "application/pdf",
          content: pdfBuffer, // send Buffer directly
        },
        {
          name: "VisitorPass.png",
          type: "image/png",
          content: passImageBuffer,
          cid: "visitor_pass", // referenced in HTML
        },
        {
          name: "VisitorQR.png",
          type: "image/png",
          content: qrBuffer,
          cid: "visitor_qr", // referenced in HTML
        },
      ]);
    }

    res.json({ msg: "Visitor scheduled successfully!", visitor });
  } catch (err) {
    console.error("Schedule Visitor Error:", err);
    res.status(500).json({ msg: "Error scheduling visitor", error: err.message });
  }
};

// ===== Approve Visitor =====
exports.approveVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ msg: "Visitor not found" });

    const host = await User.findOne({ empId: visitor.hostEmpId });
    const alreadyApproved = visitor.status === "approved";

    visitor.status = "approved";

    // Generate QR if missing
    if (!visitor.qrData) {
      visitor.qrData = await generateQRBase64(JSON.stringify({ visitorId }));
    }
    const qrBuffer = Buffer.from(visitor.qrData.split(",")[1], "base64");

    // Generate PDF & PNG in-memory
    const pdfBuffer = await generatePDF({ ...visitor._doc, hostName: host?.name }, visitor.qrData);
    const passImageBuffer = await generateVisitorPassImage({ ...visitor._doc, hostName: host?.name });

    visitor.passPdf = null;
    visitor.passImage = null;
    await visitor.save();

    // --- Send email if email exists ---
    if (visitor.email) {
      const passBase64 = passImageBuffer.toString("base64");

      const emailHTML = `
        <div style="max-width:400px;margin:0 auto;font-family:sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#3b82f6;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold;">
            VPMS Visitor Pass
          </div>
          <div style="padding:16px;text-align:center;">
            <img src="data:image/png;base64,${passBase64}" alt="Visitor Pass" style="width:300px;height:auto;" />
          </div>
          <div style="background:#10b981;color:white;text-align:center;padding:12px;font-size:20px;font-weight:bold">
            Please show this pass at the entrance.
          </div>
        </div>
      `;

      await sendEmail(visitor.email, "Your VPMS Visitor Pass", emailHTML, [
        { name: "VisitorPass.pdf", type: "application/pdf", content: pdfBuffer },
        { name: "VisitorQR.png", type: "image/png", content: qrBuffer },
      ]);
    }

    res.json({
      msg: alreadyApproved ? "Visitor is already approved" : "Visitor approved successfully",
      visitor,
    });

  } catch (err) {
    console.error("Approve Visitor Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// get visitor
exports.getMyVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ hostEmpId: Number(req.user.empId) }).sort({ scheduledAt: -1 });

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
        photo: v.photo || null, 
      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching your visitors" });
  }
};

//  Change Password 
exports.changePassword = async (req, res) => {
  try {
    const { empId, newPassword, confirmPassword } = req.body;

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

// Approve Visitor

// exports.approveVisitor = async (req, res) => {
//   try {
//     const { visitorId } = req.params;
//     const visitor = await Visitor.findById(visitorId);
//     if (!visitor) return res.status(404).json({ msg: "Visitor not found" });

//     const host = await User.findOne({ empId: visitor.hostEmpId });
//     const alreadyApproved = visitor.status === "approved";

//     visitor.status = "approved";

//     // Generate QR if missing
//     if (!visitor.qrData) {
//       visitor.qrData = await generateQRBase64(JSON.stringify({ visitorId }));
//     }

//     // Generate PDF & PNG in memory
//     const pdfBuffer = await generatePDF({ ...visitor._doc, hostName: host?.name }, visitor.qrData);
//     const passImage = await generateVisitorPassImage({ ...visitor._doc, hostName: host?.name });
//     const qrBuffer = Buffer.from(visitor.qrData.split(",")[1], "base64");

//     visitor.passPdf = null;
//     visitor.passImage = null;
//     await visitor.save();

//     // Send email
//     if (visitor.email) {
//       const emailHTML = `
//         <div style="max-width:400px;margin:0 auto;font-family:sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
//           <div style="background:#3b82f6;color:white;text-align:center;padding:16px;font-size:20px;font-weight:bold;">
//             VPMS Visitor Pass
//           </div>
//           <div style="padding:16px;text-align:center;">
//             <img src="cid:visitor_pass" alt="Visitor Pass" style="width:300px;height:auto;" />
//           </div>
//           <div style="background:#10b981;color:white;text-align:center;padding:12px;font-size:20px;font-weight:bold">
//             Please show this pass at the entrance.
//           </div>
//         </div>
//       `;

//       await sendEmail(visitor.email, "Your VPMS Visitor Pass", emailHTML, [
//         { filename: "VisitorPass.png", content: passImage, cid: "visitor_pass" },
//         { filename: "VisitorPass.pdf", content: pdfBuffer },
//         { filename: "VisitorQR.png", content: qrBuffer, cid: "visitor_qr" },
//       ]);
//     }

//     res.json({
//       msg: alreadyApproved ? "Visitor is already approved" : "Visitor approved successfully",
//       visitor,
//     });
//   } catch (err) {
//     console.error("Approve Visitor Error:", err);
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// };




// ===== Reject Visitor =====
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

// // employeeController.js
// exports.addVisitorByEmployee = async (req, res) => {
//   try {
//     const employee = req.user;
//     if (!employee || employee.role !== "employee")
//       return res.status(403).json({ msg: "Access denied" });

//     const allowedSlots = ["slot1", "slot2", "slot3", "other"];
//     const slot = allowedSlots.includes(req.body.slot) ? req.body.slot : "other";

//     const visitorData = {
//       name: req.body.name,
//       email: req.body.email,
//       phone: req.body.phone,
//       hostEmpId: employee.empId,
//       hostName: employee.name,
//       purpose: req.body.purpose,
//       scheduledAt: req.body.scheduledAt,
//       slot,
//       status: "pending",
//       photo: req.file ? req.file.filename : null,
//     };

//     const newVisit = await Visitor.create(visitorData);

//     // Optional: generate QR or PDF/email here if desired for pending visitors

//     res.status(201).json({ msg: "Visitor scheduled successfully", data: newVisit });
//   } catch (err) {
//     console.error("Add Visitor Error:", err);
//     res.status(500).json({ msg: "Server Error" });
//   }
// };



















