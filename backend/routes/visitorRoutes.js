const express = require("express");
const router = express.Router();
const {
  addVisitor,
  loginVisitor,
  getMyVisits,registerVisitorForm
} = require("../controllers/visitorController");
const { registerVisitor } = require("../controllers/authController");
const visitorAuth = require("../middleware/visitorAuth");
const upload = require("../middleware/upload"); // multer upload
const Visitor = require("../models/Visitor");


// --------------------- Visitor Auth Routes ---------------------
// Register visitor
router.post("/register", registerVisitor);

//register form
router.post("/add", upload.single("photo"), registerVisitorForm);


// Login visitor
router.post("/visitor/login", loginVisitor);

// --------------------- Visitor Visit Routes ---------------------
// Schedule a visit (must be logged in)
router.post("/schedule-visit", visitorAuth, upload.single("photo"), addVisitor);

// Get logged-in visitor visits
router.get("/my-visits", visitorAuth, getMyVisits);

// --------------------- Available Slots ---------------------
router.get("/available-slots/:empId/:date", async (req, res) => {
  try {
    const { empId, date } = req.params;
    const parsedDate = new Date(date);

    const dayStart = new Date(parsedDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(parsedDate.setHours(23, 59, 59, 999));

    // Fetch all visits for that employee on that day
    const bookings = await Visitor.find({
      hostEmpId: Number(empId),
      scheduledAt: { $gte: dayStart, $lte: dayEnd },
    });

    const allSlots = ["09:00 AM", "11:00 AM", "02:00 PM"];
    const bookedSlots = bookings
      .map(v =>
        v.slot === "slot1"
          ? "09:00 AM"
          : v.slot === "slot2"
          ? "11:00 AM"
          : v.slot === "slot3"
          ? "02:00 PM"
          : null
      )
      .filter(Boolean);

    const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

    res.json({ availableSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
