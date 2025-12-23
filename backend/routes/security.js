const express = require("express");
const router = express.Router();
const { getVisitors, scanQR, visitorsInside,getVisitorLogs, } = require("../controllers/securityController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["security"]));

router.get("/visitors", getVisitors);
router.get("/visitors-inside", visitorsInside);
router.post("/scan", scanQR);
router.get("/visitor-logs", getVisitorLogs);



module.exports = router;
