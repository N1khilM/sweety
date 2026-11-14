const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const pool = require("../config/db");

let userA;
let userB;
let today;

const password = "StrongPass123!";

async function registerUser(name, email) {
  return request(app)
    .post("/api/auth/register")
    .send({ name, email, password });
}

async function getDate(daysAgo = 0) {
  const result = await pool.query(
    "SELECT (CURRENT_DATE - $1::integer)::text AS date",
    [daysAgo],
  );

  return result.rows[0].date;
}

describe("Sweety API integration tests", () => {
  before(async () => {
    await pool.query("TRUNCATE TABLE readings, users RESTART IDENTITY CASCADE");

    today = await getDate();

    const response = await registerUser("Test User A", "testusera@sweety.test");

    assert.equal(response.status, 201);
    userA = response.body;
  });

  after(async () => {
    await pool.end();
  });

  it("registers a new user", async () => {
    assert.ok(userA.token);
    assert.equal(userA.user.email, "testusera@sweety.test");
    assert.equal(userA.user.name, "Test User A");
    assert.equal(userA.user.password, undefined);
  });

  it("rejects duplicate email registration", async () => {
    const response = await registerUser(
      "Another User",
      "testusera@sweety.test",
    );

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Email is already registered.");
  });

  it("logs in with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testusera@sweety.test",
      password,
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.token);
  });

  it("rejects invalid login credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "testusera@sweety.test",
      password: "WrongPassword123!",
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Invalid email or password.");
  });

  it("blocks access without an authentication token", async () => {
    const response = await request(app).get("/api/readings");

    assert.equal(response.status, 401);
  });

  it("creates a glucose reading", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: today,
        slot: "morning",
        value: 105,
      });

    assert.equal(response.status, 201);
  });

  it("rejects a missing glucose value", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: today,
        slot: "after_breakfast",
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Please enter a glucose value.");
  });

  it("rejects glucose values outside the allowed range", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: today,
        slot: "after_breakfast",
        value: 39,
      });

    assert.equal(response.status, 400);
    assert.equal(
      response.body.message,
      "Value must be between 40 and 600 mg/dl.",
    );
  });

  it("rejects decimal glucose values", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: today,
        slot: "after_breakfast",
        value: 105.5,
      });

    assert.equal(response.status, 400);
  });

  it("rejects future reading dates", async () => {
    const futureDate = await pool.query(
      "SELECT (CURRENT_DATE + 1)::text AS date",
    );

    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: futureDate.rows[0].date,
        slot: "after_breakfast",
        value: 110,
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Date cannot be in the future.");
  });

  it("rejects duplicate readings for the same slot and date", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: today,
        slot: "morning",
        value: 120,
      });

    assert.equal(response.status, 409);
    assert.equal(
      response.body.message,
      "You already have an Morning (fasting) reading for this date.",
    );
  });

  it("allows only four readings per day", async () => {
    const date = await getDate(1);
    const slots = ["morning", "after_breakfast", "after_lunch", "after_dinner"];

    for (const slot of slots) {
      const response = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          reading_date: date,
          slot,
          value: 100,
        });

      assert.equal(response.status, 201);
    }

    const fifthResponse = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({
        reading_date: date,
        slot: "morning",
        value: 110,
      });

    assert.equal(fifthResponse.status, 400);
    assert.equal(
      fifthResponse.body.message,
      "You can add only 4 readings per day.",
    );
  });

  it("returns only the authenticated user's readings", async () => {
    const response = await request(app)
      .get("/api/readings")
      .set("Authorization", `Bearer ${userA.token}`);

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.readings));
    assert.ok(response.body.readings.length > 0);
  });

  it("prevents one user from accessing another user's readings", async () => {
    const registration = await registerUser(
      "Test User B",
      "testuserb@sweety.test",
    );

    assert.equal(registration.status, 201);
    userB = registration.body;

    const response = await request(app)
      .get("/api/readings")
      .set("Authorization", `Bearer ${userB.token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.readings.length, 0);
  });
});
