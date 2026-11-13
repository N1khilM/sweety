# Sweety 🍬 – Blood Glucose Tracker

A full-stack blood glucose tracking application built with React, Node.js, Express, and PostgreSQL.

Users can securely record daily glucose readings, manage their reading history, and view daily and monthly reports.

## Features

- User registration and login with JWT authentication.
- Secure password hashing using bcrypt.
- Add, edit, and delete glucose readings.
- Four reading slots per day:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Input validation (40–600 mg/dL).
- Prevent duplicate readings for the same slot and date.
- Prevent future-dated readings.
- Daily glucose summary.
- Month-to-date report.
- Previous month's report.
- User-specific reading access.
- Responsive dashboard.

## Tech Stack

**Frontend**

- React
- Vite
- JavaScript
- CSS

**Backend**

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcryptjs

## Project Structure

```text
sweety/
├── client/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- npm

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd sweety
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE sweety;
```

Run the SQL schema to create the `users` and `readings` tables.

### 3. Configure the backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sweety
JWT_SECRET=your_secure_random_secret
```

### 4. Configure the frontend

Open another terminal:

```bash
cd client
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Seed demo data

From the server directory:

```bash
npm run seed
```

Demo credentials:

- Email: demo@sweety.com
- Password: DemoPass123!

### 6. Start the backend

```bash
cd server
npm run dev
```

### 7. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in your terminal (usually http://localhost:5173).

## API Endpoints

### Authentication

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| POST   | `/api/auth/register` | Register a user |
| POST   | `/api/auth/login`    | Login           |

### Glucose Readings

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/api/readings`     | Get user's readings |
| POST   | `/api/readings`     | Add a reading       |
| PUT    | `/api/readings/:id` | Update a reading    |
| DELETE | `/api/readings/:id` | Delete a reading    |

### Reports

| Method | Endpoint                                     | Description          |
| ------ | -------------------------------------------- | -------------------- |
| GET    | `/api/reports/daily?date=YYYY-MM-DD`         | Daily report         |
| GET    | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET    | `/api/reports/monthly?month=YYYY-MM`         | Monthly report       |

All reading and report endpoints require a valid JWT bearer token.

## Validation Rules

- Glucose values must be integers between 40 and 600 mg/dL.
- Only one reading is allowed per slot per day.
- A maximum of four readings is allowed per day.
- Future dates are not allowed.
- Users can access only their own readings.

## Notes & Assumptions

- Each user has four predefined reading slots per day.
- Monthly reports cover the complete previous calendar month.
- Month-to-date reports cover the first day of the selected month through the selected date.
- Empty reports display a friendly empty state.
- Demo data is provided through the seed script.
- Authentication uses JWT-based protected API routes.
