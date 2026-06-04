const pool = require("../config/db");

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const { name, department_id, phone, address, designation, salary } =
      req.body;

    const result = await pool.query(
      `INSERT INTO employee_profiles
      (name, department_id, phone, address, designation, salary)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [name, department_id, phone, address, designation, salary],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Employees
const getEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ep.id,
        ep.name,
        ep.department_id,
        d.department_name,
        ep.designation,
        ep.salary,
        ep.phone,
        ep.address
      FROM employee_profiles ep
      LEFT JOIN departments d
      ON ep.department_id = d.id
      ORDER BY ep.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Employee By ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM employee_profiles WHERE id=$1",
      [id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Assign Skills
const assignSkills = async (req, res) => {
  try {
    const { employee_id, skill_ids } = req.body;

    for (const skillId of skill_ids) {
      await pool.query(
        `INSERT INTO employee_skills
        (employee_id, skill_id)
        VALUES($1,$2)`,
        [employee_id, skillId],
      );
    }

    res.json({
      message: "Skills Assigned Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Employee + Department
const getEmployeeDepartment = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      ep.name,
      d.department_name
      FROM employee_profiles ep
      INNER JOIN departments d
      ON ep.department_id = d.id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Employee + Skills
const getEmployeeSkills = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      ep.name,
      s.skill_name
      FROM employee_skills es
      INNER JOIN employee_profiles ep
      ON es.employee_id = ep.id
      INNER JOIN skills s
      ON es.skill_id = s.id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Upload Files
const uploadFiles = async (req, res) => {
  try {
    res.json({
      message: "Files Uploaded Successfully",
      files: req.files,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM employee_profiles WHERE id=$1", [id]);

    res.json({
      message: "Employee Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  assignSkills,
  getEmployeeDepartment,
  getEmployeeSkills,
  uploadFiles,
  deleteEmployee,
};
