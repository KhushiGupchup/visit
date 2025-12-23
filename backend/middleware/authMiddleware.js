const jwt = require("jsonwebtoken");
const User = require("../models/User");


const authMiddleware = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "Access Denied - No Token" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    // Fetch user by ID (works for both admin and employee)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ msg: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Invalid Token" });
  }
};

module.exports = authMiddleware;
