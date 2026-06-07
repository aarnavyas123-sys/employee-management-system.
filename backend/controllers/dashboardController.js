const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const employees = await pool.query(
      "SELECT COUNT(*) FROM employee_profiles",
    );

    const departments = await pool.query("SELECT COUNT(*) FROM departments");

    const skills = await pool.query("SELECT COUNT(*) FROM skills");

    res.json({
      totalEmployees: Number(employees.rows[0].count),
      totalDepartments: Number(departments.rows[0].count),
      totalSkills: Number(skills.rows[0].count),
      totalImages: 0,
    });
  } catch (error) {
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
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getDepartmentChart,
  getLeaveStatusChart,
};
