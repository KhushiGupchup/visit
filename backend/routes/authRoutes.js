// routes/authRoutes.js
const express = require("express");
const { login, registerVisitor, registerUser } = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);            // User register
router.post("/login", login);                      // User + visitor login
router.post("/visitor/register", registerVisitor);// Visitor register

module.exports = router;
