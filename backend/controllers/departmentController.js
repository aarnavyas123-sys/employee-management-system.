const pool = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

// Get All Departments
const getDepartments = asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM departments ORDER BY id");

  res.json(result.rows);
});

// Add Department
const createDepartment = asyncHandler(async (req, res) => {
  const { department_name } = req.body;

  const result = await pool.query(
    `
    INSERT INTO departments(department_name)
    VALUES($1)
    RETURNING *
    `,
    [department_name],
  );

  res.status(201).json(result.rows[0]);
});

// Delete Department
const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM departments WHERE id=$1", [id]);

  res.json({
    message: "Department Deleted Successfully",
  });
});

module.exports = {
  getDepartments,
  createDepartment,
  deleteDepartment,
};
