const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
  try {
    const name = "Demo User";
    const email = "demo@sweety.com";
    const password = "DemoPass123!";

    // Create or update demo user
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password = EXCLUDED.password
       RETURNING id`,
      [name, email, hashedPassword],
    );

    const userId = userResult.rows[0].id;

    // Sample readings for the last three days
    const sampleReadings = [
      ["morning", 105],
      ["after_breakfast", 145],
      ["after_lunch", 132],
      ["after_dinner", 118],
    ];

    for (let daysAgo = 0; daysAgo < 3; daysAgo++) {
      for (const [slot, value] of sampleReadings) {
        await pool.query(
          `INSERT INTO readings (user_id, reading_date, slot, value)
           VALUES ($1, CURRENT_DATE - $2::integer, $3, $4)
           ON CONFLICT (user_id, reading_date, slot)
           DO NOTHING`,
          [userId, daysAgo, slot, value],
        );
      }
    }

    console.log("Database seeded successfully!");
    console.log("Demo email:", email);
    console.log("Demo password:", password);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();
