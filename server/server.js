const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Sweety API is running!" });
});
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    userId: req.user.id,
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
