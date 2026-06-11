# 🏢 Employee Management System (EMS)

A comprehensive, full-stack enterprise Employee Management System built using React, Node.js, Express, and PostgreSQL, containerized with Docker. The system supports multi-role Access Control (Admin, HR, Manager, Employee), interactive dashboards, leave management workflows, real-time clock-in/out attendance tracking, asset management, automated notification jobs, compliance audit logs, and data exports.

---

## 🚀 Key Features

### 🔐 Multi-Role Access Control (RBAC)
- **Admin**: Full system control. Can create users, update user roles (preventing self-downgrade), modify account statuses (Active, Inactive, Suspended), and view admin analytics.
- **HR**: Manage employee profiles, departments, skills, final leave approvals, and review compliance audit logs.
- **Manager**: View team details, review/approve/reject leave requests, and view approval history.
- **Employee**: Manage personal profile, record clock-in/out attendance, apply for leaves, and track leave status.

### 📅 Attendance & Leave Workflow
- **Daily Clock-In/Clock-Out**: Sandboxed daily attendance log with late-arrival tracking (marks "Late" after 09:00 AM) and shift duration calculations.
- **Hierarchical Leave Workflow**:
  1. Employee applies for leave.
  2. Manager reviews, approves, or rejects the application.
  3. HR performs final authorization, which automatically updates the employee's remaining leave balance.
- **Automated Leave Reminders**: Daily background cron jobs send email reminders about pending approvals.

### 🖥️ Interactive Dashboards & Analytics
- Visualized statistics (active users, role breakdowns, department distributions) using **Recharts**.
- Audit log dashboard for tracking critical operations like role modifications and status changes.

### 💾 Data Export & Reports
- Export employee profile list, leave reports, and attendance records to Excel format (`.xlsx`).

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router v7, React Icons, React Toastify, Bootstrap 5, Recharts, Axios
- **Backend**: Node.js, Express.js (v5), PostgreSQL (`pg` pool client), Multer (file uploads), Winston (structured logging)
- **Database**: PostgreSQL (with custom indexing for high-performance searches on names, departments, etc.)
- **Containerization**: Docker & Docker Compose
- **Background Jobs**: Node Cron & Nodemailer (email notifications)

---

## 📁 Project Structure

```text
Employee-Management-System/
├── backend/
│   ├── config/              # DB connection, logger setup, cache setup
│   ├── controllers/         # Business logic for API endpoints
│   ├── jobs/                # Background cron jobs (e.g., leave reminders)
│   ├── middleware/          # JWT auth validation, error handling
│   ├── repositories/        # Database access layers
│   ├── routes/              # Express API route mapping
│   ├── services/            # Specialized business services
│   ├── utils/               # Common helper utilities (e.g., audit logging)
│   ├── validations/         # Request body validation schemas (Joi)
│   ├── server.js            # App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Navbar, etc.)
│   │   ├── pages/           # Page layouts (Dashboard, AuditLogs, Attendance, etc.)
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx         # App bootstrapping
│   ├── package.json
│   └── vite.config.js
├── docs/                    # Technical architecture & API reference documentation
├── docker-compose.yml       # Docker environment compose services configuration
└── README.md                # System overview and local launch instructions
```

---

## ⚙️ Getting Started

### 📋 Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v15 or higher) OR **Docker Desktop**

---

### 🐳 Running with Docker (Recommended)
You can launch the entire ecosystem (Database, Backend, and Frontend) with a single command using Docker Compose:

1. Clone the repository and navigate to the project root:
   ```bash
   cd Employee-Management-System
   ```

2. Build and run the containers:
   ```bash
   docker-compose up --build
   ```

3. The services will be accessible at:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
   - **PostgreSQL Database**: Port `5432`

---

### 💻 Local Development Setup (Manual)

If you prefer to run the services individually on your host machine, follow these instructions:

#### 1. Database Configuration
Create a PostgreSQL database named `ems_db` and ensure your database service is running. You can run the index optimization scripts located in [database-optimization-report.md](file:///c:/Users/lenovo/Employee-Management-System/docs/database-optimization-report.md).

#### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder (use the template below):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=ems_db
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

#### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to [http://localhost:5173](http://localhost:5173).

---

## 📘 Documentation & References

- **API Endpoints Reference**: Read the detailed API routes and request/response payloads in [api-documentation.md](file:///c:/Users/lenovo/Employee-Management-System/docs/api-documentation.md).
- **Database Index Optimization**: Read details of database optimization strategies in [database-optimization-report.md](file:///c:/Users/lenovo/Employee-Management-System/docs/database-optimization-report.md).
