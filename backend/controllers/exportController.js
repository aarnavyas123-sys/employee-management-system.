const pool = require("../config/db");
const XLSX = require("xlsx");

const exportEmployees = async (req, res) => {
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

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result.rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const exportLeaves = async (req, res) => {
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

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result.rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=leaves.xlsx");

    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const exportAssets = async (req, res) => {
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

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result.rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=assets.xlsx");

    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  exportEmployees,
  exportLeaves,
  exportAssets,
};
