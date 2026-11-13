const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Validate YYYY-MM-DD strictly
const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// Get the next calendar day
const getNextDay = (date) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
};

// Reusable summary calculation
const getSummary = async (userId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS count,
       MAX(value)::int AS highest,
       MIN(value)::int AS lowest,
       ROUND(AVG(value), 1)::float AS average
     FROM readings
     WHERE user_id = $1
       AND reading_date >= $2::date
       AND reading_date < $3::date`,
    [userId, startDate, endDate],
  );

  return result.rows[0];
};

// =================================
// DAILY REPORT
// =================================
router.get("/daily", async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    const nextDay = getNextDay(date);

    const [summary, readings] = await Promise.all([
      getSummary(req.user.id, date, nextDay),

      pool.query(
        `SELECT
           id,
           TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
           slot,
           value
         FROM readings
         WHERE user_id = $1
           AND reading_date = $2::date
         ORDER BY id ASC`,
        [req.user.id, date],
      ),
    ]);

    res.json({
      type: "daily",
      date,
      summary,
      readings: readings.rows,
    });
  } catch (error) {
    console.error("Daily report error:", error);
    res.status(500).json({
      message: "Server error.",
    });
  }
});

// =================================
// MONTH-TO-DATE REPORT
// =================================
router.get("/month-to-date", async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    const startDate = `${date.slice(0, 7)}-01`;
    const endDate = getNextDay(date);

    const summary = await getSummary(req.user.id, startDate, endDate);

    res.json({
      type: "month-to-date",
      startDate,
      endDate: date,
      summary,
    });
  } catch (error) {
    console.error("Month-to-date report error:", error);
    res.status(500).json({
      message: "Server error.",
    });
  }
});

// =================================
// FULL MONTH REPORT
// =================================
router.get("/monthly", async (req, res) => {
  try {
    const { month } = req.query;

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) {
      return res.status(400).json({
        message: "Please provide a valid month (YYYY-MM).",
      });
    }

    const startDate = `${month}-01`;

    const [year, monthNumber] = month.split("-").map(Number);

    const nextMonth = new Date(Date.UTC(year, monthNumber, 1));

    const endDate = nextMonth.toISOString().slice(0, 10);

    const summary = await getSummary(req.user.id, startDate, endDate);

    res.json({
      type: "monthly",
      month,
      summary,
    });
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({
      message: "Server error.",
    });
  }
});

module.exports = router;
