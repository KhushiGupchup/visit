const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check if user is logged in
const authMiddleware = async (req, res, next) => {

  // Get token from request header
  let token = req.headers["authorization"];

  // No token then no access
  if (!token) {
    return res.status(401).json({ msg: "Access Denied - No Token" });
  }

  // Remove "Bearer " from token and take remaining part
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    // verify token and read user info
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SECRET_KEY"
    );

    // Find the user by the id
    const user = await User.findById(decoded.id).select("-password");

    // check whether user present or not
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Attach user to request for later use
    req.user = user;

  //do next steps
    next();

  } catch (err) {
    // Token is invalid or expired
    console.error(err);
    return res.status(401).json({ msg: "Invalid Token" });
  }
};

module.exports = authMiddleware;
