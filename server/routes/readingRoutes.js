const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

const validSlots = [
  "morning",
  "after_breakfast",
  "after_lunch",
  "after_dinner",
];

const slotLabels = {
  morning: "Morning (fasting)",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};

// ADD READING
router.post("/", async (req, res) => {
  try {
    const { reading_date, slot, value } = req.body;

    if (!value && value !== 0) {
      return res.status(400).json({
        message: "Please enter a glucose value.",
      });
    }

    if (
      !Number.isInteger(Number(value)) ||
      Number(value) < 40 ||
      Number(value) > 600
    ) {
      return res.status(400).json({
        message: "Value must be between 40 and 600 mg/dl.",
      });
    }

    if (!reading_date) {
      return res.status(400).json({
        message: "Reading date is required.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    const dateCheck = await pool.query(
      `SELECT $1::date > CURRENT_DATE AS is_future,
              $1::date::text AS parsed_date`,
      [reading_date],
    );

    if (dateCheck.rows[0].parsed_date !== reading_date) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    if (dateCheck.rows[0].is_future) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    if (!validSlots.includes(slot)) {
      return res.status(400).json({
        message: "Please select a valid reading slot.",
      });
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM readings
       WHERE user_id = $1 AND reading_date = $2`,
      [req.user.id, reading_date],
    );

    if (Number(countResult.rows[0].count) >= 4) {
      return res.status(400).json({
        message: "You can add only 4 readings per day.",
      });
    }

    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, reading_date, slot, Number(value)],
    );

    res.status(201).json({
      message: "Glucose reading added successfully!",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: `You already have an ${slotLabels[req.body.slot]} reading for this date.`,
      });
    }

    console.error("Add reading error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET ALL MY READINGS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, id DESC`,
      [req.user.id],
    );

    res.json({ readings: result.rows });
  } catch (error) {
    console.error("Get readings error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// UPDATE READING
router.put("/:id", async (req, res) => {
  try {
    const { reading_date, slot, value } = req.body;
    const { id } = req.params;

    if (
      !Number.isInteger(Number(value)) ||
      value === "" ||
      value === undefined ||
      Number(value) < 40 ||
      Number(value) > 600
    ) {
      return res.status(400).json({
        message: "Value must be between 40 and 600 mg/dl.",
      });
    }

    if (!reading_date || !/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    if (!validSlots.includes(slot)) {
      return res.status(400).json({
        message: "Please select a valid reading slot.",
      });
    }

    const dateCheck = await pool.query(
      `SELECT $1::date > CURRENT_DATE AS is_future,
              $1::date::text AS parsed_date`,
      [reading_date],
    );

    if (dateCheck.rows[0].parsed_date !== reading_date) {
      return res.status(400).json({
        message: "Please provide a valid date.",
      });
    }

    if (dateCheck.rows[0].is_future) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1, slot = $2, value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [reading_date, slot, Number(value), id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    res.json({
      message: "Reading updated successfully!",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: `You already have an ${slotLabels[req.body.slot]} reading for this date.`,
      });
    }

    console.error("Update reading error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// DELETE READING
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    res.json({ message: "Reading deleted successfully!" });
  } catch (error) {
    console.error("Delete reading error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
