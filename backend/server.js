require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const skillRoutes = require("./routes/skillRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const leaveTypeRoutes = require("./routes/leaveTypeRoutes");
const assetRoutes = require("./routes/assetRoutes");
const assetAllocationRoutes = require("./routes/assetAllocationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const exportRoutes = require("./routes/exportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const healthRoutes = require("./routes/healthRoutes");
const auditRoutes = require("./routes/auditRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const viewRoutes = require("./routes/viewRoutes");
const logger = require("./config/logger");
const startLeaveReminderJob = require("./jobs/leaveReminderJob");
const emailRoutes = require("./routes/emailRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://employee-management-system.vercel.app",
  "https://employee-management.vercel.app",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Routes */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/dashboard-stats", dashboardRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/leave-types", leaveTypeRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/asset-allocations", assetAllocationRoutes);
app.use("/api/v1/password", passwordRoutes);
app.use("/api/v1/export", exportRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/health", healthRoutes); // Fallback for standard checks
app.use("/api/v1/views", viewRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/audit-logs", auditRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
/* Protected Dashboard */
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome Dashboard",
    user: req.user,
  });
});

/* Root Route */
app.get("/", (req, res) => {
  res.send("EMS Backend Running");
});

/* Error Handler MUST be LAST */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

startLeaveReminderJob();

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
