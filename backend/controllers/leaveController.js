const pool = require("../config/db");

// Apply Leave
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

    const result = await pool.query(
      `INSERT INTO leave_applications
      (
        employee_id,
        leave_type_id,
        from_date,
        to_date,
        total_days,
        reason
      )
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [employee_id, leave_type_id, from_date, to_date, total_days, reason],
    );

    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        details
      )
      VALUES($1,$2,$3)
      `,
      [1, "Leave Applied", `Leave Application ID ${result.rows[0].id} created`],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Leave Requests
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
      INNER JOIN employee_profiles ep
      ON la.employee_id = ep.id
      INNER JOIN leave_types lt
      ON la.leave_type_id = lt.id
      ORDER BY la.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Approve Leave
// Approve Leave (Manager Approval)
const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='Manager Approved'
      WHERE id=$1
      `,
      [id],
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [id, 1, "Manager Approved", "Manager Approved Leave"],
    );

    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        details
      )
      VALUES($1,$2,$3)
      `,
      [1, "Manager Approved", `Leave ID ${id} Manager Approved`],
    );

    res.json({
      message: "Manager Approved Successfully",
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Reject Leave
const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='Rejected'
      WHERE id=$1
      `,
      [id],
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [id, 1, "Rejected", "Manager Rejected Leave"],
    );

    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        details
      )
      VALUES($1,$2,$3)
      `,
      [1, "Leave Rejected", `Leave ID ${id} rejected`],
    );

    res.json({
      message: "Leave Rejected Successfully",
    });
  } catch (error) {
    console.error("REJECT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Approval History
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

      LEFT JOIN leave_applications la
      ON ah.leave_id = la.id

      LEFT JOIN employee_profiles ep
      ON la.employee_id = ep.id

      LEFT JOIN users u
      ON ah.approved_by = u.id

      ORDER BY ah.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM audit_logs
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// HR Final Approval
const hrApproveLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='HR Approved'
      WHERE id=$1
      `,
      [id],
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [id, 1, "HR Approved", "HR Final Approval"],
    );

    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        details
      )
      VALUES($1,$2,$3)
      `,
      [1, "HR Approved", `Leave ID ${id} HR Approved`],
    );

    res.json({
      message: "HR Approved Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// HR Reject Leave
// HR Reject Leave
const hrRejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='HR Rejected'
      WHERE id=$1
      `,
      [id],
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [id, 1, "HR Rejected", "HR Rejected Leave"],
    );

    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        details
      )
      VALUES($1,$2,$3)
      `,
      [1, "HR Rejected", `Leave ID ${id} HR Rejected`],
    );

    res.json({
      message: "HR Rejected Successfully",
    });
  } catch (error) {
    console.error("HR REJECT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
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
