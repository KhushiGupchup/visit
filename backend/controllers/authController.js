const User = require("../models/User");
const Visitor = require("../models/Visitor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  REGISTER USER 
exports.registerUser = async (req, res) => {
  try {
    const { email, password, role, name, empId } = req.body;//take the all fields from employee add form

    if (!email || !password || !role) {
      return res.status(400).json({ msg: "All required fields must be filled" });
    }

    const emailLower = email.trim().toLowerCase();
    const exists = await User.findOne({ email: emailLower });//find the email
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password.trim(), 10);//hashed the password
    //store the details
    const newUser = new User({
      email: emailLower,
      password: hashed,
      role,
      name,
      empId,
    });

    await newUser.save();
    res.json({ msg: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

//  REGISTER VISITOR to have login
exports.registerVisitor = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword)
      return res.status(400).json({ msg: "All fields are required" });

    if (password.trim() !== confirmPassword.trim())
      return res.status(400).json({ msg: "Passwords do not match" });

    const emailLower = email.trim().toLowerCase();
    const exists = await Visitor.findOne({ email: emailLower });//find visitor email 
    if (exists) return res.status(400).json({ msg: "Visitor already exists" });

    const hashed = await bcrypt.hash(password.trim(), 10);
//add the visitor email and password
    const newVisitor = new Visitor({
      email: emailLower,
      password: hashed,
    });

    await newVisitor.save();
    res.json({ msg: "Visitor registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

//  LOGIN both for user and visitor
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Please enter both email and password" });

    const loginEmail = email.trim().toLowerCase();
    const loginPassword = password.trim();

    //  Search in Users first 
    let user = await User.findOne({ email: { $regex: `^${loginEmail}$`, $options: "i" } });
    if (user) {
      const match = await bcrypt.compare(loginPassword, user.password);
      if (!match) return res.status(400).json({ msg: "Invalid Credentials" });

      const token = jwt.sign(
        { id: user._id, role: user.role, empId: user.empId, name: user.name },
        process.env.JWT_SECRET ,
        { expiresIn: "1d" }
      );

      return res.json({
        msg: "Login Success",
        token,
        role: user.role,
        empId: user.empId,
        name: user.name,
        email: user.email,
      });
    }

    //  Search in Visitors if visitor is login
   const visitor = await Visitor.findOne({
  email: { $regex: `^${loginEmail}$`, $options: "i" },
  password: { $exists: true }
});

    if (visitor) {
      if (!visitor || !visitor.password) {
  return res.status(400).json({ msg: "Invalid credentials" });
}

      const match = await bcrypt.compare(loginPassword, visitor.password);
      if (!match) return res.status(400).json({ msg: "Invalid Credentials" });

      const token = jwt.sign(
        { id: visitor._id, role: "visitor", email: visitor.email },
        process.env.JWT_SECRET ",
        { expiresIn: "1d" }
      );

      return res.json({
        msg: "Login Success",
        token,
        role: "visitor",
        email: visitor.email,
      });
    }

    // if email not found in user or visitor for login
    return res.status(404).json({ msg: "User not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};



