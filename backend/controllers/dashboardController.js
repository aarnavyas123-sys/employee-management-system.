const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const employees = await pool.query(
      "SELECT COUNT(*) FROM employee_profiles",
    );

    const departments = await pool.query("SELECT COUNT(*) FROM departments");

    const skills = await pool.query("SELECT COUNT(*) FROM skills");

    res.json({
      totalEmployees: employees.rows[0].count,
      totalDepartments: departments.rows[0].count,
      totalSkills: skills.rows[0].count,
      totalImages: 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
