const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config(); 


const authRoutes = require("./routes/authRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const admin = require("./routes/admin");
const employee = require("./routes/employee");
const security = require("./routes/security")
const otpRoutes = require("./routes/otpRoutes"); // otp
const path = require("path");
const app = express();

app.use(express.json());
app.use(cors({
  origin: "https://visiopassmanagement.netlify.app",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/admin", admin);
app.use("/api/employee",employee)
app.use("/api/security",security);


app.use("/api", otpRoutes);



app.listen(5000, () => console.log("Server running on port 5000"));



