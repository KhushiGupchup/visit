const Visitor = require("../models/Visitor");
const CheckLog = require("../models/CheckLogs");

// ==============================
// Get all approved visitors
// ==============================
exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ status: "approved" }).sort({ scheduledAt: -1 });
    res.json(visitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ==============================
// Scan QR - Check In / Check Out
// ==============================
exports.scanQR = async (req, res) => {
  try {
    const { qrPayload } = req.body;
    if (!qrPayload) return res.status(400).json({ msg: "QR payload missing" });

    const data = JSON.parse(qrPayload);
    const visitor = await Visitor.findById(data.visitorId);
    if (!visitor) return res.status(404).json({ msg: "Visitor not found" });

    let log = await CheckLog.findOne({ visitor: visitor._id });

    if (!log) {
      // First time check-in
      log = await CheckLog.create({
        visitor: visitor._id,
        checkIn: new Date(),
        scannedBy: req.user.id,
      });
    } else if (!log.checkOut) {
      // Check-out
      log.checkOut = new Date();
      await log.save();
    } else {
      // Already checked out
    }

    // Populate visitor info
    log = await log.populate("visitor", "name email");

    // Restructure log for front-end: put name/email at root
    const formattedLog = {
  _id: log._id,
  name: log.visitor?.name || "Unknown",
  email: log.visitor?.email || "Unknown",
  checkIn: log.checkIn,
  checkOut: log.checkOut,
  scannedBy: log.scannedBy,
};

    console.log(formattedLog);
    // Determine message
    let msg = "Visitor already checked out";
    if (!log.checkOut) msg = "Visitor Checked In";
    else if (log.checkOut && log.checkIn) msg = "Visitor Checked Out";

    return res.json({ msg, log: formattedLog });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// ==============================
// Visitors currently inside
// ==============================
exports.visitorsInside = async (req, res) => {
  try {
    const logs = await CheckLog.find({
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    })
      .populate("visitor")
      .populate("scannedBy", "name");

    const formatted = logs.map(log => ({
      visitorName: log.visitor?.name,
      visitorEmail: log.visitor?.email,
      checkIn: log.checkIn,
      scannedBy: log.scannedBy?.name || "Unknown",
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// securityController.js
exports.getVisitorLogs = async (req, res) => {
  try {
    const logs = await CheckLog.find()
      .populate("visitor", "name email") // include visitor details
      .populate("scannedBy", "name"); // security name

    const formatted = logs.map(log => ({
      _id: log._id,
      name: log.visitor?.name,
      email: log.visitor?.email,
      checkIn: log.checkIn,
      checkOut: log.checkOut,
      scannedBy: log.scannedBy?.name || "Unknown",
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


