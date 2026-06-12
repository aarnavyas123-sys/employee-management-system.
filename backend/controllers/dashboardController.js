const pool = require("../config/db");
const logger = require("../config/logger");

const getDashboardStats = async (req, res) => {
  try {
    const employees = await pool.query(
      "SELECT COUNT(*) FROM employee_profiles",
    );

    const departments = await pool.query("SELECT COUNT(*) FROM departments");

    const skills = await pool.query("SELECT COUNT(*) FROM skills");

    const totalAssets = await pool.query("SELECT COUNT(*) FROM assets");

    const allocatedAssets = await pool.query(
      "SELECT COUNT(*) FROM assets WHERE status='Allocated'",
    );

    const availableAssets = await pool.query(
      "SELECT COUNT(*) FROM assets WHERE status='Available'",
    );

    res.json({
      totalEmployees: Number(employees.rows[0].count),
      totalDepartments: Number(departments.rows[0].count),
      totalSkills: Number(skills.rows[0].count),

      totalAssets: Number(totalAssets.rows[0].count),
      allocatedAssets: Number(allocatedAssets.rows[0].count),
      availableAssets: Number(availableAssets.rows[0].count),

      totalImages: 0,
    });
  } catch (error) {
    logger.error(`Dashboard Stats Error: ${error.message}`);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getDepartmentChart = async (req, res) => {
  try {
    const result = await pool.query(`       SELECT
        d.department_name,
        COUNT(ep.id)::int AS total
      FROM departments d
      LEFT JOIN employee_profiles ep
      ON d.id = ep.department_id
      GROUP BY d.department_name
      ORDER BY total DESC
    `);

    res.json(result.rows);
  } catch (error) {
    logger.error(`Department Chart Error: ${error.message}`);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getLeaveStatusChart = async (req, res) => {
  try {
    const result = await pool.query(`       SELECT
        status,
        COUNT(*)::int AS total
      FROM leave_applications
      GROUP BY status
    `);

    res.json(result.rows);
  } catch (error) {
    logger.error(`Leave Status Chart Error: ${error.message}`);

    res.status(500).json({
      message: error.message,
    });
  }
};
const getAssetChart = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      status,
      COUNT(*)::int AS total
      FROM assets
      GROUP BY status
    `);

    res.json(result.rows);
  } catch (error) {
    logger.error(`Asset Chart Error: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getDepartmentChart,
  getLeaveStatusChart,
  getAssetChart,
};
