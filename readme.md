# Sweety 🍬 – Blood Glucose Tracker

A full-stack blood glucose tracking application built with **React, Node.js, Express, and PostgreSQL**.

Sweety helps users securely record daily blood glucose readings, manage their reading history, and monitor glucose trends through daily and monthly reports.

## 🚀 Live Demo

<https://sweety-glucose.vercel.app/>

- **Frontend:** Vercel
- **Backend API:** https://sweety-1xhc.onrender.com
- **API Health Check:** https://sweety-1xhc.onrender.com/api/health
- **Database:** PostgreSQL hosted on Neon

## ✨ Features

- User registration and login with JWT authentication
- Secure password hashing using bcrypt
- Add, edit, and delete glucose readings
- Four predefined reading slots per day:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Glucose input validation (40–600 mg/dL)
- Duplicate reading prevention for the same slot and date
- Future-date validation
- Daily glucose summary
- Month-to-date report
- Previous month's report
- User-specific reading access
- Responsive dashboard

## 🛠️ Tech Stack

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

**Database & Deployment**

- PostgreSQL – Neon
- Backend – Render
- Frontend – Vercel

## 📁 Project Structure

```text
sweety/
├── client/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── config/
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── screenshots/
├── .gitignore
└── README.md
```

## 📋 Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- npm

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/N1khilM/sweety.git
cd sweety
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE sweety;
```

Run the database schema from the project root:

```bash
psql -U postgres -d sweety -f server/database/schema.sql
```

### 3. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sweety
JWT_SECRET=your_secure_random_secret
```

### 4. Configure the frontend

Open another terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file using `.env.example`:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Seed demo data (Optional)

To create a demo account and sample glucose readings, run from the server directory:

```bash
npm run seed
```

**Demo credentials** (if the seed script has been executed):

- Email: `demo@sweety.com`
- Password: `DemoPass123!`

### 6. Start the backend

From the server directory:

```bash
npm run dev
```

The backend will run at `http://localhost:5000`.

### 7. Start the frontend

In another terminal, from the client directory:

```bash
npm run dev
```

Open the Vite development URL (usually `http://localhost:5173`).

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Authenticate a user |

### Glucose Readings

| Method | Endpoint            | Description                           |
| ------ | ------------------- | ------------------------------------- |
| GET    | `/api/readings`     | Get the authenticated user's readings |
| POST   | `/api/readings`     | Add a glucose reading                 |
| PUT    | `/api/readings/:id` | Update a reading                      |
| DELETE | `/api/readings/:id` | Delete a reading                      |

### Reports

| Method | Endpoint                                     | Description             |
| ------ | -------------------------------------------- | ----------------------- |
| GET    | `/api/reports/daily?date=YYYY-MM-DD`         | Daily report            |
| GET    | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report    |
| GET    | `/api/reports/monthly?month=YYYY-MM`         | Previous month's report |

All reading and report endpoints require a valid JWT bearer token.

## ✅ Validation Rules

- Glucose values must be integers between 40 and 600 mg/dL.
- Only one reading is allowed per slot per day.
- A maximum of four readings is allowed per day.
- Future dates are not allowed.
- Users can access only their own readings.

## 📝 Notes & Assumptions

- Each user has four predefined reading slots per day.
- Daily reports show readings for the selected date.
- Month-to-date reports cover the first day of the selected month through the selected date.
- Monthly reports cover the complete previous calendar month.
- Empty reports display an appropriate empty state.
- Demo data can be generated using the optional seed script.
- Authentication is handled using JWT-based protected API routes.
- Environment variables are used for database credentials and authentication secrets.

## 👨‍💻 Author

**Nikhil Mugali**

- GitHub: https://github.com/N1khilM
- LinkedIn: https://www.linkedin.com/in/nikhilmugali/
- Portfolio: https://nikhilmugali-portfolio.vercel.app/

---

Built with ❤️ using the PERN stack.
