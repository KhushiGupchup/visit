const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

const seedAdmin = async () => {
  try {
    console.log("🌱 Starting Admin Seeding...");

    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB Connected");

    const email = "admin@example.com";       // hardcoded admin email
    const password = "admin@123";            // hardcoded admin password

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`✔ Admin already exists: ${existingAdmin.email}`);
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "admin",
      department: "Management",
    });

    console.log("🎉 Admin created successfully:", admin.email);
    process.exit();
  } catch (error) {
    console.error("❌ Error while seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
