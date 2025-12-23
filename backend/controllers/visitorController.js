const Visitor = require("../models/Visitor");
const Employee = require("../models/User"); // ⭐ MUST ADD THIS
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.addVisitor = async (req, res) => {
  try {
    const visitor = req.visitor; // from JWT token

    // 1️⃣ Get employee details using hostEmpId from request
    const host = await Employee.findOne({ empId: Number(req.body.hostEmpId) });

    if (!host) {
      return res.status(404).json({ msg: "Employee not found for given ID" });
    }

    // 2️⃣ Validate slot
    const allowedSlots = ["slot1", "slot2", "slot3", "other"];
    let slot = allowedSlots.includes(req.body.slot) ? req.body.slot : "other";

    // 3️⃣ Build visit data
    const visitorData = {
      name: req.body.name,            // visitor name from form
      email: visitor.email,           // logged-in visitor email
      phone: req.body.phone,          // visitor phone from form

      hostEmpId: Number(req.body.hostEmpId),
      hostName: host.name,            // ✅ get employee name from User collection

      purpose: req.body.purpose,
      scheduledAt: req.body.scheduledAt,
      slot,
      status: "pending",
      photo: req.file ? req.file.filename : visitor.photo || null,
    };

    // 4️⃣ Save visit
    const newVisit = await Visitor.create(visitorData);
    console.log(newVisit);

    res.status(201).json({
      msg: "Visit scheduled successfully",
      data: newVisit,
    });

  } catch (err) {
    console.error("Schedule Visit Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};


// ---------------------- SCHEDULE VISIT (LOGGED-IN VISITOR) ----------------------
// exports.addVisitor = async (req, res) => {
//   try {
//     const visitor = req.visitor; // logged-in visitor from token

//     // ⭐ FETCH HOST NAME USING hostEmpId
//     const host = await Employee.findOne({ empId: Number(req.body.hostEmpId) });

//     const allowedSlots = ["slot1", "slot2", "slot3", "other"];
//     let slot = allowedSlots.includes(req.body.slot) ? req.body.slot : "other";

//     const visitorData = {
//       name: req.body.name,
//       email: visitor.email,
//       phone: req.body.phone,

//       // ⭐ SAVE BOTH ID AND NAME
//       hostEmpId: Number(req.body.hostEmpId),
//       hostName: host ? host.name : "Unknown",

//       purpose: req.body.purpose,
//       scheduledAt: req.body.scheduledAt,
//       slot,
//       status: "pending",
//       photo: req.file ? req.file.filename : visitor.photo
//     };

//     const newVisit = await Visitor.create(visitorData);

//     res.status(201).json({
//       msg: "Visit scheduled successfully",
//       data: newVisit,
//     });

//   } catch (err) {
//     console.error("Schedule Visit Error:", err);
//     res.status(500).json({ msg: "Server Error" });
//   }
// };


// ---------------------- GET LOGGED-IN VISITOR'S VISITS ----------------------
exports.getMyVisits = async (req, res) => {
  try {
    const visitorEmail = req.visitor.email;

    const visits = await Visitor.find({ email: visitorEmail })
                                .sort({ scheduledAt: -1 });

    const formatted = await Promise.all(visits.map(async (v) => {
      let hostName = v.hostName; // fallback to stored name

      // If hostName not stored, fetch from Employee collection
      if (!hostName) {
        const host = await Employee.findOne({ empId: v.hostEmpId });
        hostName = host ? host.name : "Unknown";
      }

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

        hostEmpId: v.hostEmpId,
        hostName,   // ✅ now will fetch if missing

        photo: v.photo || null,
      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Get Visits Error:", err);
    res.status(500).json({ msg: "Error fetching your visits" });
  }
};

// exports.getMyVisits = async (req, res) => {
//   try {
//     const visitorEmail = req.visitor.email;

//     const visits = await Visitor.find({ email: visitorEmail })
//                                 .sort({ scheduledAt: -1 });

//     const formatted = visits.map(v => ({
//       _id: v._id,
//       name: v.name,
//       email: v.email,
//       phone: v.phone,
//       purpose: v.purpose,
//       status: v.status,
//       scheduledAt: v.scheduledAt,
//       slot: v.slot,
//       qrData: v.qrData,

//       hostEmpId: v.hostEmpId,
//       hostName: v.hostName || "Unknown",   // ⭐ Now will NOT be unknown

//       photo: v.photo || null,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error("Get Visits Error:", err);
//     res.status(500).json({ msg: "Error fetching your visits" });
//   }
// };


// ---------------------- VISITOR LOGIN ----------------------
exports.loginVisitor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Please enter both email and password" });

    const visitor = await Visitor.findOne({ email: email.trim().toLowerCase() });

    if (!visitor)
      return res.status(404).json({ msg: "Visitor not found" });

    const isMatch = await bcrypt.compare(password, visitor.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: visitor._id, role: "visitor", email: visitor.email },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login Success",
      token,
      role: "visitor",
      email: visitor.email,
      name: visitor.name,
      phone: visitor.phone
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};


// ---------------------- REGISTER VISITOR FROM FORM ----------------------
exports.registerVisitorForm = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      hostEmpId,
      purpose,
      scheduledAt,
      slot
    } = req.body;

    if (!name || !email || !phone || !hostEmpId || !purpose || !scheduledAt || !slot) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 1️⃣ Get host employee
    const host = await Employee.findOne({ empId: Number(hostEmpId) });
    if (!host) return res.status(404).json({ msg: "Employee not found" });

    // 2️⃣ Validate slot
    const allowedSlots = ["slot1", "slot2", "slot3", "other"];
    const selectedSlot = allowedSlots.includes(slot) ? slot : "other";

    // 3️⃣ Prepare visitor data
    const visitorData = {
      name,
      email: email.trim().toLowerCase(),
      phone,
      hostEmpId: Number(hostEmpId),
      hostName: host.name,
      purpose,
      scheduledAt,
      slot: selectedSlot,
      status: "pending",
      photo: req.file ? req.file.filename : null
    };

    // 4️⃣ Save visitor
    const newVisit = await Visitor.create(visitorData);

    res.status(201).json({
      msg: "Visitor registered successfully",
      data: newVisit
    });

  } catch (err) {
    console.error("Register Visitor Form Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};
