const pool = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");
const logAction = require("../utils/auditLogger");

// 1. CLOCK IN
const clockIn = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;

  // Check if already clocked in today
  const existing = await pool.query(
    "SELECT * FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE",
    [employeeId]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({ message: "You have already clocked in today." });
  }

  // Determine status (Shift boundary: 9:00 AM local time)
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const status = (hours > 9 || (hours === 9 && minutes > 0)) ? "Late" : "Present";

  const result = await pool.query(
    `INSERT INTO attendance (employee_id, date, clock_in, status)
     VALUES ($1, CURRENT_DATE, NOW(), $2)
     RETURNING *`,
    [employeeId, status]
  );

  // Log action
  await logAction(employeeId, "Clock In", `Employee clocked in as ${status} at ${now.toLocaleTimeString()}`);

  res.status(201).json({
    message: "Clocked In Successfully ✅",
    attendance: result.rows[0],
  });
});

// 2. CLOCK OUT
const clockOut = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;

  // Check today's entry
  const existing = await pool.query(
    "SELECT * FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE",
    [employeeId]
  );

  if (existing.rows.length === 0) {
    return res.status(400).json({ message: "You must clock in first before clocking out." });
  }

  const attendance = existing.rows[0];
  if (attendance.clock_out) {
    return res.status(400).json({ message: "You have already clocked out today." });
  }

  // Update clock out and calculate total hours
  const result = await pool.query(
    `UPDATE attendance
     SET clock_out = NOW(),
         total_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600, 2)
     WHERE employee_id = $1 AND date = CURRENT_DATE
     RETURNING *`,
    [employeeId]
  );

  // Log action
  await logAction(employeeId, "Clock Out", `Employee clocked out. Total Hours: ${result.rows[0].total_hours}`);

  res.json({
    message: "Clocked Out Successfully ✅",
    attendance: result.rows[0],
  });
});

// 3. GET TODAY'S ATTENDANCE STATUS
const getTodayAttendance = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;

  const result = await pool.query(
    "SELECT * FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE",
    [employeeId]
  );

  if (result.rows.length === 0) {
    return res.json({ clockedIn: false, clockedOut: false, attendance: null });
  }

  const attendance = result.rows[0];
  res.json({
    clockedIn: true,
    clockedOut: !!attendance.clock_out,
    attendance,
  });
});

// 4. GET ATTENDANCE HISTORY
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { id: currentUserId, role } = req.user;
  const { employee_id, status, date } = req.query;

  let query = `
    SELECT a.*, u.name as employee_name, u.email as employee_email
    FROM attendance a
    JOIN users u ON a.employee_id = u.id
  `;
  const values = [];
  const clauses = [];

  // Sandbox standard employees to their own logs
  if (role === "Employee") {
    clauses.push(`a.employee_id = $${values.length + 1}`);
    values.push(currentUserId);
  } else {
    // Admin, HR, Manager can filter by specific employee
    if (employee_id) {
      clauses.push(`a.employee_id = $${values.length + 1}`);
      values.push(employee_id);
    }
  }

  // Apply filters
  if (status) {
    clauses.push(`a.status = $${values.length + 1}`);
    values.push(status);
  }

  if (date) {
    clauses.push(`a.date = $${values.length + 1}`);
    values.push(date);
  }

  if (clauses.length > 0) {
    query += " WHERE " + clauses.join(" AND ");
  }

  query += " ORDER BY a.date DESC, a.clock_in DESC";

  const result = await pool.query(query, values);
  res.json(result.rows);
});

module.exports = {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAttendanceHistory,
};
