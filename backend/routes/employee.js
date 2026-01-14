const express = require("express");
const router = express.Router();
const {
  dashboard,
  scheduleVisitor,
  changePassword,
  getMyVisitors,
  approveVisitor,
  deleteVisitor,
  rejectVisitor,
  
} = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../utils/upload");

// Apply middlewares
router.use(authMiddleware); // check token & attach user
router.use(roleMiddleware(["employee"])); // only employees

// Dashboard
router.get("/dashboard", dashboard);

// Schedule visitor
router.post("/schedule-visitor", scheduleVisitor);

// Change password
router.post("/change-password", changePassword);

// Get my visitors
router.get("/my-visitors", getMyVisitors);

// Approve visitor
router.post("/approve-visitor/:visitorId", approveVisitor);

// Delete visitor
router.delete("/delete-visitor/:visitorId", deleteVisitor);

router.patch("/reject-visitor/:visitorId", rejectVisitor);

module.exports = router;


