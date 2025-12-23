// backend/middlewares/visitorAuth.js
const jwt = require("jsonwebtoken");
const Visitor = require("../models/Visitor"); // Make sure this model exists

const visitorAuth = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "Access Denied - No Token" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    // Fetch visitor by ID
    const visitor = await Visitor.findById(decoded.id).select("-password");
    if (!visitor) return res.status(401).json({ msg: "Visitor not found" });

    req.visitor = visitor; // attach visitor to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Invalid Token" });
  }
};

module.exports = visitorAuth;
