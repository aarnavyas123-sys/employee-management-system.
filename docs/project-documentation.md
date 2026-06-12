# Enterprise Employee Management System (EMS) - Project Documentation

## 1. Executive Summary
The Enterprise Employee Management System (EMS) is a secure, role-based, full-stack application designed to streamline internal human resource workflows. The system integrates authentication, profile management, attendance tracking, leave requests, asset allocation, compliance audit logging, notifications, and analytics reporting.

---

## 2. Technology Stack & Architecture

### Backend Architecture
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database Engine**: PostgreSQL
- **Query Client**: `pg` (node-postgres connection pool client)
- **Logging Service**: Winston Logger (structured log outputs for production audit tracking)
- **Authentication**: JSON Web Token (JWT) with password hashing via `bcrypt`
- **Mail Service**: Nodemailer (SMTP transport configuration for leave reminders)

### Frontend Architecture
- **Build Tool**: Vite
- **Library**: React (v19)
- **Routing**: React Router DOM (v7)
- **UI Framework**: Bootstrap (v5) & Custom CSS Stylesheets
- **State Management**: React Hooks (`useState`, `useEffect`, context-driven page structures)
- **HTTP Client**: Axios with automated request interceptor injection
- **Analytics & Charts**: Recharts
- **Notifications**: React Toastify (success/error alerts)

### Deployment Design
- **Frontend**: Vercel (Single Page App deployment with dynamic VITE environment variables)
- **Backend**: Render (Node.js web service running server.js with automated PORT and health checks)
- **Database**: Managed Cloud PostgreSQL (Neon/Render/Supabase DB server)

---

## 3. Database Schema Design
The relational database schema consists of 10 tables designed to enforce referential integrity and support advanced cascading behaviors:

1. **`users`**: Manages credentials, roles (`Admin`, `HR`, `Manager`, `Employee`), and status (`Active`, `Inactive`).
2. **`departments`**: Holds organizational departments and reference mappings to department managers.
3. **`employee_profiles`**: Maps one-to-one with a user record, tracking contact details, salary, designation, and remaining leaves.
4. **`leave_requests`**: Manages leave applications and tracks double-signature status (`Pending` -> `Manager Approved` -> `Approved` / `Rejected`).
5. **`attendance`**: Daily log tracking clock-in/out times, statuses (`Present`, `Late`, `Absent`), and shift hours.
6. **`assets`**: Catalogs corporate equipment and inventories (monitors, laptops, etc.).
7. **`asset_allocations`**: Handles physical allocation assignments, tracking start date, return date, and allocator.
8. **`notifications`**: Administrative messages created for broadcast or direct alerts.
9. **`notification_recipients`**: Tracks individual user read/unread status for system notifications.
10. **`audit_logs`**: Tracks critical actions, actors, and IP addresses to maintain security audits.

---

## 4. Module Specifications

### A. Authentication & Authorization
- Hashed passwords using `bcrypt`.
- Stateless authentication using JWT tokens.
- Role-based route protection on both backend and frontend layers.

### B. Employee Profile & Departments
- Standardized CRUD operations.
- Direct association of profiles with organizational departments.
- Tracks administrative fields such as salary, designation, and remaining leave balance.

### C. Attendance & Shift Tracking
- Single click Clock-In and Clock-Out buttons.
- Automatically flags late check-ins (e.g. past 9:00 AM) as `Late`.
- Computes total shift duration and stores attendance logs.

### D. Leave Workflow System
- Multi-tier workflow: Employees submit requests, Managers approve/deny (advancing to `Manager Approved`), and HR signs off (marking as `Approved`).
- On HR approval, remaining leave balances are automatically adjusted.

### E. Corporate Asset Management
- Complete inventory tracking of company hardware.
- Tracks assignment status (`Available`, `Allocated`, `Maintenance`).
- Logs return histories.

### F. Security Compliance & Audits
- Automatically logs all critical actions (role updates, profile edits, deletions, authentication events).
- Captures client IP addresses and user identifiers.
- Exposed exclusively to the `Admin` role to satisfy enterprise compliance audits.
