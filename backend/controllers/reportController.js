const pool = require("../config/db");

// Employee Report
const employeeReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      u.name,
      u.email,
      d.department_name,
      ep.designation,
      ep.salary

      FROM users u

      JOIN employee_profiles ep
      ON u.id = ep.user_id

      JOIN departments d
      ON d.id = ep.department_id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Leave Report
const leaveReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      ep.name,
      lt.leave_name,
      la.status,
      la.from_date,
      la.to_date

      FROM leave_applications la

      JOIN employee_profiles ep
      ON la.employee_id = ep.id

      JOIN leave_types lt
      ON la.leave_type_id = lt.id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Asset Report
const assetReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      a.asset_name,
      a.asset_type,
      a.status,
      ep.name

      FROM asset_allocations aa

      JOIN assets a
      ON aa.asset_id = a.id

      JOIN employee_profiles ep
      ON aa.employee_id = ep.id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  employeeReport,
  leaveReport,
  assetReport,
};
