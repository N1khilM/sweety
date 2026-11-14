const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Sweety API is running!" });
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

module.exports = app;
