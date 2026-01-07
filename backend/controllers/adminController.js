const User = require("../models/User");
const Visitor = require("../models/Visitor");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Dashboard 
exports.dashboard = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });//count all employee
    const totalVisitors = await Visitor.countDocuments();//count all visitors
    const pendingVisitors = await Visitor.countDocuments({ status: "pending" });//count that visitor with status pending

    res.json({ totalEmployees, totalVisitors, pendingVisitors });//response of all
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error loading dashboard data" });
  }
};


// Add employee
exports.addEmployee = async (req, res) => {
  const { name, email, department, role } = req.body;//all fields in form

  try {
    // Check if email already exists and tell user
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Email already exists" });

    // Get last user with empId
    const lastUser = await User.findOne({
      empId: { $exists: true }
    }).sort({ empId: -1 }).select("empId");

    //start empId with 1001
    const nextEmpId = lastUser ? lastUser.empId + 1 : 1001;

    // Generate random password  and hashed that password 
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee and store it
    const newUser = await User.create({
      name,
      email,
      department,
      role: role || "employee", // default
      empId: nextEmpId,
      password: hashedPassword
    });

    // Send login details to email anf one time password randomly genaerated
    await sendEmail(
      email,
      "Your Login Credentials",
      `
        <h2>Your Account Has Been Created</h2>
        <p><b>Employee ID:</b> ${nextEmpId}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
        <p><b>Role:</b> ${role || "employee"}</p>
      `
    );

    res.json({
      msg: "Employee added successfully",
      user: newUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};



// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      empId: { $exists: true }   // fetch ALL employees & security
    }).select("-password");//remove the password for security purpose

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Get all visitors

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });//latest first

    const formatted = visitors.map((v) => ({
      _id: v._id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      host: v.hostEmpId || "Not specified", // just show id of emp
      status: v.status,
      scheduledAt: v.scheduledAt,//date
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching visitors" });
  }
};


// Delete an employee and all related visitors
exports.deleteEmployee = async (req, res) => {
  try {
    const { empId } = req.params;//id

    // Find the employee
    const employee = await User.findOne({ empId: Number(empId) });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    // Delete all visitors related with that emp 
    await Visitor.deleteMany({
      $or: [
        { hostEmpId: Number(empId) },
        { visitingEmpId: Number(empId) } // prev in visitor model
      ]
    });

    // Delete the employee
    await User.deleteOne({ empId: Number(empId) });

    res.json({ msg: "Employee and all related visitors deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting employee", error: err.message });
  }
};


// Reports
exports.reports = async (req, res) => {
  try {
    // Total counts
    const totalVisitors = await Visitor.countDocuments();
    const approved = await Visitor.countDocuments({ status: "approved" });
    const pending = await Visitor.countDocuments({ status: "pending" });
    const rejected = await Visitor.countDocuments({ status: "rejected" });

    // Slot counts
    const slotCountsAgg = await Visitor.aggregate([
      { $group: { _id: "$slot", count: { $sum: 1 } } }
    ]);

    // Initialize counts
    const slotCounts = { slot1: 0, slot2: 0, slot3: 0, other: 0 };

    // Map DB values to slotCounts object
  
    slotCountsAgg.forEach(s => {
      const slotName = s._id;      // e.g., "slot1", "slot2", etc.
      const count = s.count;       // number of visitors in that slot
    
      // If the slot exists in slotCounts, use it; otherwise, add to 'other'
      slotCounts[slotName] = slotCounts[slotName] || 0; // ensure it exists
      if (slotCounts[slotName] !== undefined) {
        slotCounts[slotName] = count;
      } else {
        slotCounts.other += count;//count increased of other slot
      }
    });

    // get count of how many visitor the emp have
    const hostAgg = await Visitor.aggregate([
      { $group: { _id: "$hostEmpId", count: { $sum: 1 } } }
    ]);

    // list the 
    const hostStats = await Promise.all(
      hostAgg.map(async h => {
        const emp = await User.findOne({ empId: h._id }).select("name");//get emp name
        return { host: emp ? emp.name : `Emp-${h._id}`, count: h.count };//show emp name or id and count
      })
    );

   
   // count visitors for last 7 days
    const weekly = [];
    
    for (let i = 6; i >= 0; i--) {
      // get the date i days ago
      const date = new Date();
      date.setDate(date.getDate() - i);
    
      // count visitors for this day
      const count = await Visitor.countDocuments({
        createdAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)), // start of day
          $lte: new Date(date.setHours(23, 59, 59, 999)) // end of day
        }
      });
    
      // add date only not time  and count
      weekly.push({
        day: date.toISOString().split("T")[0],
        count
      });
    }
    

    // Respond with full report data
    res.json({
      totals: { totalVisitors, approved, pending, rejected },
      slotCounts,
      hostStats,
      weekly
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error generating reports", error: err.message });
  }
};






