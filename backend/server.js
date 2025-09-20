const express = require("express");
require("dotenv").config();
const connectToDb = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // for serving uploads

const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,              // ✅ allow cookies
}));
app.use(cookieParser());

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to database
connectToDb();

// Test route
app.get("/", (req, res) => {
  res.send("Hey there!!");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
