const User = require("../models/User");
const Visitor = require("../models/Visitor");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { generateQRBase64 } = require("../utils/generateQR");


//Dashboard 

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


// Schedule Visitor

exports.scheduleVisitor = async (req, res) => {
  try {
    const { name, email, phone, purpose, scheduledAt } = req.body;

    //  Validate
    if (!name || !phone || !scheduledAt) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    const dateObj = new Date(scheduledAt);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ msg: "Invalid scheduled date" });
    }

    // Slot 
    let slot = "other";
    const hours = dateObj.getHours();
    if (hours >= 9 && hours < 11) slot = "slot1";
    else if (hours >= 11 && hours < 14) slot = "slot2";
    else if (hours >= 14 && hours < 15) slot = "slot3";

    //  Create visitor
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

       // Only store visitorId in QR 
     const qrPayload = visitor._id.toString();
      const qrBase64 = await generateQRBase64(qrPayload);

    // (Optional) store QR in DB
    visitor.qrData = qrBase64;
    await visitor.save();

    //  Send QR back to frontend
    res.json({
      msg: "Visitor scheduled successfully!",
      visitor,
      qr: qrBase64, // qr
    });

  } catch (err) {
    console.error("Schedule Visitor Error:", err);
    res.status(500).json({
      msg: "Error scheduling visitor",
      error: err.message,
    });
  }
};
// Approve Visitor
exports.approveVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ msg: "Visitor not found" });

    const host = await User.findOne({ empId: visitor.hostEmpId });
    const alreadyApproved = visitor.status === "approved";

    // Approve visitor
    visitor.status = "approved";

    // Generate QR if missing
    if (!visitor.qrData) {
      visitor.qrData = await generateQRBase64(JSON.stringify({ visitorId }));
    }
    const qrBuffer = Buffer.from(visitor.qrData.split(",")[1], "base64");

   
    await visitor.save();

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


//  Reject Visitor 
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


































