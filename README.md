# 💧 Water Management System

A full MERN stack application for managing customer complaints, meter readings, and field tasks for a water utility.

## 📁 Project Structure

```
water-management/
├── backend/                # Node.js + Express API
│   ├── models/             # MongoDB Mongoose schemas
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── MeterReading.js
│   │   └── Task.js
│   ├── routes/             # API route handlers
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── meter.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js         # JWT auth + role checking
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/               # React app
    ├── public/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Complaints.js
    │   │   ├── NewComplaint.js
    │   │   ├── MeterReadings.js
    │   │   └── Tasks.js
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm

### Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/water_management
JWT_SECRET=any_long_random_string_here
```

Start the backend:
```bash
npm run dev
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will open at http://localhost:3000

### Step 3: Create Admin User

After starting, register a user normally, then manually update their role in MongoDB:

```js
// In MongoDB shell or Compass:
db.users.updateOne({ email: "admin@water.com" }, { $set: { role: "admin" } })
```

Or use MongoDB Compass GUI to change the role field.

## 👥 User Roles

| Role | Access |
|------|--------|
| **customer** | Submit & track their own complaints |
| **technician** | View all complaints, record meter readings, update assigned tasks |
| **supervisor** | All technician access + assign tasks, view dashboard |
| **admin** | Full access to everything |

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Complaints
- `GET /api/complaints` — List complaints (filtered by role)
- `POST /api/complaints` — Submit complaint
- `PUT /api/complaints/:id` — Update status (staff only)
- `GET /api/complaints/export/csv` — Export CSV (admin/supervisor)

### Meter Readings
- `GET /api/meter` — List readings
- `POST /api/meter` — Add reading (staff only)
- `GET /api/meter/export/csv` — Export for billing

### Tasks
- `GET /api/tasks` — List tasks
- `POST /api/tasks` — Assign task (supervisor/admin)
- `PUT /api/tasks/:id` — Update task status
- `GET /api/tasks/report/summary?period=daily|weekly` — Work summary report

### Dashboard
- `GET /api/dashboard/stats` — Aggregated statistics (admin/supervisor)

## ✨ Features

- ✅ Customer self-service complaint portal with unique reference numbers
- ✅ Status tracking: Received → In Progress → Resolved
- ✅ Admin dashboard with charts (by status, category, location)
- ✅ Meter reading capture with auto-calculated consumption
- ✅ Task assignment with role-based access (Supervisor/Technician)
- ✅ Daily/weekly work summary reports
- ✅ CSV export for complaints and meter readings
- ✅ JWT authentication with role-based access control
