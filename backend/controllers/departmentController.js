const pool = require("../config/db");

// Get All Departments
const getDepartments = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments ORDER BY id");

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Department
const createDepartment = async (req, res) => {
  try {
    const { department_name } = req.body;

    const result = await pool.query(
      `INSERT INTO departments(department_name)
       VALUES($1)
       RETURNING *`,
      [department_name],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM departments WHERE id=$1", [id]);

    res.json({
      message: "Department Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  deleteDepartment,
};
