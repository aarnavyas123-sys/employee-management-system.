const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logAction = require("../utils/auditLogger");

// ==========================================================================
// 1. SIGNUP (Default Role: Employee, Default Status: Active)
// ==========================================================================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Explicitly inserting 'Active' status for the new user profile
    const result = await pool.query(
      `
      INSERT INTO users(name, email, password, role, status)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, status
      `,
      [name, email, hashedPassword, "Employee", "Active"],
    );

    const newUser = result.rows[0];

    // Auto-create default employee profile and initialize leave balances
    const profileResult = await pool.query(
      `INSERT INTO employee_profiles (user_id, name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [newUser.id, newUser.name]
    );
    if (profileResult.rows.length > 0) {
      const newEmployee = profileResult.rows[0];
      const leaveTypes = await pool.query("SELECT id, total_days FROM leave_types");
      for (const lt of leaveTypes.rows) {
        await pool.query(
          `INSERT INTO leave_balance (employee_id, leave_type_id, remaining_days)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [newEmployee.id, lt.id, lt.total_days]
        );
      }
    }

    // Audit Log Action Trigger
    await logAction(
      newUser.id,
      "User Registered",
      `${newUser.name} registered in the system as an Employee`,
    );

    res.status(201).json({
      message: "User Registered Successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================================================
// 2. LOGIN (Enforced Status Guardrail Check)
// ==========================================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Enforce Corporate Security Guardrail: Check account status state limits
    if (user.status === "Inactive") {
      return res
        .status(403)
        .json({ message: "Account is inactive. Please contact HR." });
    }
    if (user.status === "Suspended") {
      return res
        .status(403)
        .json({ message: "Access Denied: This account has been Suspended." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Audit Log Action Trigger
    await logAction(
      user.id,
      "User Login",
      `${user.name} logged into the system`,
    );

    res.json({
      message: "Login Successful",
      token,
      role: user.role,
      name: user.name,
      id: user.id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================================================
// 3. ADMIN ONLY: CREATE USER
// ==========================================================================
const createUser = async (req, res) => {
  try {
    // 🛡️ Guardrail 1: Enforce Admin Role Gate Control FIRST
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can create users" });
    }

    const { name, email, password, role, status } = req.body;
    const userStatus = status || "Active";

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users(name, email, password, role, status)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, status
      `,
      [name, email, hashedPassword, role, userStatus],
    );

    const newUser = result.rows[0];

    // Auto-create default employee profile and initialize leave balances if user is not Admin
    if (role !== "Admin") {
      const profileResult = await pool.query(
        `INSERT INTO employee_profiles (user_id, name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING *`,
        [newUser.id, newUser.name]
      );
      if (profileResult.rows.length > 0) {
        const newEmployee = profileResult.rows[0];
        const leaveTypes = await pool.query("SELECT id, total_days FROM leave_types");
        for (const lt of leaveTypes.rows) {
          await pool.query(
            `INSERT INTO leave_balance (employee_id, leave_type_id, remaining_days)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [newEmployee.id, lt.id, lt.total_days]
          );
        }
      }
    }

    await logAction(
      req.user.id,
      "User Created",
      `Admin created ${role} account for ${name} (Status: ${userStatus})`,
    );

    res.status(201).json({
      message: "User Created Successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================================================
// 4. ADMIN ONLY: FETCH ALL SYSTEM USERS
// ==========================================================================
const getUsers = async (req, res) => {
  try {
    // 🛡️ Enforce Admin Guardrail Gate immediately
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can access users" });
    }

    // Returning status alongside standard metrics to keep frontend directory in sync
    const result = await pool.query(`
      SELECT id, name, email, role, status 
      FROM users 
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================================================
// 5. ADMIN ONLY: UPDATE USER ROLE (Prevent Self-Downgrade)
// ==========================================================================
const updateUserRole = async (req, res) => {
  try {
    // 🛡️ Enforce Admin Guardrail Gate immediately
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can update roles" });
    }

    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["Admin", "HR", "Manager", "Employee"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Fetch old role details for descriptive audit metrics logging
    const targetUser = await pool.query(
      "SELECT name, role FROM users WHERE id = $1",
      [id],
    );
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRole = targetUser.rows[0].role;
    const userName = targetUser.rows[0].name;

    const result = await pool.query(
      `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, name, email, role, status
      `,
      [role, id],
    );

    // Audit Log Track Layer Trigger
    await logAction(
      req.user.id,
      "Role Updated",
      `Changed role of ${userName} (ID: ${id}) from ${oldRole} to ${role}`,
    );

    res.json({
      message: "User role updated successfully ✅",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================================================
// 6. ADMIN ONLY: UPDATE USER WORKFLOW STATUS State Matrix
// ==========================================================================
const updateUserStatus = async (req, res) => {
  try {
    // 🛡️ Enforce Admin Guardrail Gate immediately
    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only Admin can modify user status states" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const targetUser = await pool.query(
      "SELECT name, status FROM users WHERE id = $1",
      [id],
    );
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldStatus = targetUser.rows[0].status;
    const userName = targetUser.rows[0].name;

    const result = await pool.query(
      `
      UPDATE users
      SET status = $1
      WHERE id = $2
      RETURNING id, name, email, role, status
      `,
      [status, id],
    );

    // Audit Log Track Layer Trigger
    await logAction(
      req.user.id,
      "Status Changed",
      `Changed account status of ${userName} (ID: ${id}) from ${oldStatus} to ${status}`,
    );

    res.json({
      message: `User status state modified to ${status} successfully`,
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ==========================================================================
// ADMIN ONLY: GET DASHBOARD STATS ANALYTICS MATRIX
// ==========================================================================
const getAdminAnalytics = async (req, res) => {
  try {
    // 🛡️ Security Enforcer: Restricted exclusive access to Admin users
    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Access Denied: Admin role authorization required." });
    }

    // High performance single-pass conditional aggregation query execution
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*)::INT AS total_users,
        COUNT(CASE WHEN status = 'Active' THEN 1 END)::INT AS active_users,
        COUNT(CASE WHEN role = 'HR' THEN 1 END)::INT AS hr_count,
        COUNT(CASE WHEN role = 'Manager' THEN 1 END)::INT AS manager_count,
        COUNT(CASE WHEN role = 'Employee' THEN 1 END)::INT AS employee_count
      FROM users
    `);

    res.json(statsQuery.rows[0]);
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add getAdminAnalytics inside your module.exports block alongside old functions!
module.exports = {
  signup,
  login,
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getAdminAnalytics,
};
