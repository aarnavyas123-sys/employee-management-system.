const pool = require("../config/db");

// 1. Apply Leave
const applyLeave = async (req, res) => {
  try {
    const {
      employee_id,
      leave_type_id,
      from_date,
      to_date,
      total_days,
      reason,
    } = req.body;

    // Fetch operator id dynamically from auth middleware if available, fallback to 1
    const actorId = req.user?.id || 1;

    const result = await pool.query(
      `INSERT INTO leave_applications
      (employee_id, leave_type_id, from_date, to_date, total_days, reason, status)
      VALUES($1,$2,$3,$4,$5,$6, 'Pending')
      RETURNING *`,
      [employee_id, leave_type_id, from_date, to_date, total_days, reason],
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details) VALUES($1,$2,$3)`,
      [
        actorId,
        "Leave Applied",
        `Leave Application ID ${result.rows[0].id} created for Employee ID: ${employee_id}`,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Leave Requests
const getLeaves = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        la.id,
        ep.name,
        lt.leave_name,
        la.from_date,
        la.to_date,
        la.total_days,
        la.reason,
        la.status
      FROM leave_applications la
      INNER JOIN employee_profiles ep ON la.employee_id = ep.id
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      ORDER BY la.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Approve Leave (Manager Partial Approval)
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id || 1;

    await pool.query(
      `UPDATE leave_applications SET status='Manager Approved' WHERE id=$1`,
      [id],
    );

    await pool.query(
      `INSERT INTO approval_history (leave_id, approved_by, action, remarks) VALUES($1,$2,$3,$4)`,
      [id, actorId, "Manager Approved", "Manager Approved Leave"],
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details) VALUES($1,$2,$3)`,
      [actorId, "Manager Approved", `Leave ID ${id} Manager Approved`],
    );

    res.json({ message: "Manager Approved Successfully" });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Reject Leave (Manager Level)
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id || 1;

    await pool.query(
      `UPDATE leave_applications SET status='Rejected' WHERE id=$1`,
      [id],
    );

    await pool.query(
      `INSERT INTO approval_history (leave_id, approved_by, action, remarks) VALUES($1,$2,$3,$4)`,
      [id, actorId, "Rejected", "Manager Rejected Leave"],
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details) VALUES($1,$2,$3)`,
      [actorId, "Leave Rejected", `Leave ID ${id} rejected by Manager`],
    );

    res.json({ message: "Leave Rejected Successfully" });
  } catch (error) {
    console.error("REJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5. HR FINAL APPROVAL (With Automated Leave Balance Deduction Guardrails)
const hrApproveLeave = async (req, res) => {
  const client = await pool.connect(); // Transaction management initialization
  try {
    const { id } = req.params;
    const actorId = req.user?.id || 1;

    await client.query("BEGIN"); // Initialize isolation block

    // Fetch matching application row metrics to review total days requested
    const applicationQuery = await client.query(
      "SELECT employee_id, leave_type_id, total_days, status FROM leave_applications WHERE id = $1",
      [id],
    );

    if (applicationQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Leave application record not found" });
    }

    const { employee_id, leave_type_id, total_days, status } =
      applicationQuery.rows[0];

    // Check if leave has already been processed by HR
    if (status === "HR Approved") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "Conflict: This application is already marked as finalized and approved.",
      });
    }

    // 🛡️ Guardrail Check: Verify if employee has enough remaining leave balance days
    const balanceQuery = await client.query(
      "SELECT remaining_days FROM leave_balance WHERE employee_id = $1 AND leave_type_id = $2",
      [employee_id, leave_type_id],
    );

    if (balanceQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "Data Fault: No remaining leave allocation profile exists for this employee type.",
      });
    }

    const remainingBalance = Number(balanceQuery.rows[0].remaining_days);
    if (remainingBalance < Number(total_days)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Insufficient Leave Balance! Employee requests ${total_days} days, but only has ${remainingBalance} days left.`,
      });
    }

    // A. Perform Deductions inside leave_balance table registry row
    await client.query(
      `UPDATE leave_balance 
       SET remaining_days = remaining_days - $1 
       WHERE employee_id = $2 AND leave_type_id = $3`,
      [total_days, employee_id, leave_type_id],
    );

    // B. Finalize Leave Status configuration flag
    await client.query(
      `UPDATE leave_applications SET status='HR Approved' WHERE id=$1`,
      [id],
    );

    // C. Write trace history metadata block
    await client.query(
      `INSERT INTO approval_history (leave_id, approved_by, action, remarks) VALUES($1,$2,$3,$4)`,
      [
        id,
        actorId,
        "HR Approved",
        `HR Final Approval. Automatically deducted ${total_days} days.`,
      ],
    );

    // D. Log transactional entries inside Audit ledgers
    await client.query(
      `INSERT INTO audit_logs (user_id, action, details) VALUES($1,$2,$3)`,
      [
        actorId,
        "HR Approved",
        `Leave ID ${id} HR Approved. Balance altered for employee ID ${employee_id}.`,
      ],
    );

    await client.query("COMMIT"); // Commit transactional operations safely
    res.json({
      message: "HR Approved Successfully and Leave Balance Deducted ✅",
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Reset baseline values upon exception
    console.error("HR APPROVE TRANSACTION ERROR:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release(); // Free memory context socket stream
  }
};

// 6. HR Reject Leave
const hrRejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id || 1;

    await pool.query(
      `UPDATE leave_applications SET status='HR Rejected' WHERE id=$1`,
      [id],
    );

    await pool.query(
      `INSERT INTO approval_history (leave_id, approved_by, action, remarks) VALUES($1,$2,$3,$4)`,
      [id, actorId, "HR Rejected", "HR Rejected Leave"],
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details) VALUES($1,$2,$3)`,
      [actorId, "HR Rejected", `Leave ID ${id} HR Rejected`],
    );

    res.json({ message: "HR Rejected Successfully" });
  } catch (error) {
    console.error("HR REJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 7. Approval History Index
const getApprovalHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ah.id,
        ah.leave_id,
        ep.name AS employee_name,
        u.name AS approved_by_name,
        ah.action,
        ah.remarks,
        ah.created_at
      FROM approval_history ah
      LEFT JOIN leave_applications la ON ah.leave_id = la.id
      LEFT JOIN employee_profiles ep ON la.employee_id = ep.id
      LEFT JOIN users u ON ah.approved_by = u.id
      ORDER BY ah.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 8. Audit Logs Index
// ==========================================================================
// ADMIN ONLY: ADVANCED AUDIT LOG INDEX ENGINE (With Filters & Search)
// ==========================================================================
const getAuditLogs = async (req, res) => {
  try {
    // 🛡️ Security Guardrail: Enforce Admin exclusive authorization view
    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({
          message: "Access Denied: Only Admin can access system security logs.",
        });
    }

    // Extraction of URL query parameters from frontend request
    const { search, actionType, startDate, endDate } = req.query;

    let queryText = `
      SELECT 
        al.id, 
        al.user_id, 
        u.name AS operator_name, 
        u.email AS operator_email,
        al.action, 
        al.details, 
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // 1. Dynamic Search Filter (Matches name, email, action or custom details text)
    if (search) {
      queryText += ` AND (
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex} OR 
        al.action ILIKE $${paramIndex} OR 
        al.details ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // 2. Action Type Category Dropdown Filter
    if (actionType && actionType !== "All") {
      queryText += ` AND al.action = $${paramIndex}`;
      queryParams.push(actionType);
      paramIndex++;
    }

    // 3. Date Range Temporal Filters
    if (startDate) {
      queryText += ` AND al.created_at >= $${paramIndex}`;
      queryParams.push(`${startDate} 00:00:00`);
      paramIndex++;
    }
    if (endDate) {
      queryText += ` AND al.created_at <= $${paramIndex}`;
      queryParams.push(`${endDate} 23:59:59`);
      paramIndex++;
    }

    // Clean chronological sorting layer configuration
    queryText += ` ORDER BY al.id DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("AUDIT LOG FILTERS RUNTIME CRASH:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  approveLeave,
  hrApproveLeave,
  rejectLeave,
  getApprovalHistory,
  getAuditLogs,
  hrRejectLeave,
};
