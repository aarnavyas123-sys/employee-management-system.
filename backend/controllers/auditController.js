const pool = require("../config/db");

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
  getAuditLogs,
};
