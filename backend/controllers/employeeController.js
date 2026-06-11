const pool = require("../config/db");
const cache = require("../config/cache");
const logAction = require("../utils/auditLogger");
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
    await logAction(
      req.user?.id || 1,
      "Employee Created",
      `Employee ${name} was created`,
    );
    cache.flushAll();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, department_id, phone, address, designation, salary } =
      req.body;

    const result = await pool.query(
      `
      UPDATE employee_profiles
      SET
        name=$1,
        department_id=$2,
        phone=$3,
        address=$4,
        designation=$5,
        salary=$6
      WHERE id=$7
      RETURNING *
      `,
      [name, department_id, phone, address, designation, salary, id],
    );

    cache.flushAll();
    await logAction(
      req.user?.id || 1,
      "Employee Updated",
      `Employee ID ${id} was updated`,
    );
    res.json({
      message: "Employee Updated Successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// Get All Employees
// Get All Employees
const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || "";
    const department = req.query.department || "";
    const sort = req.query.sort || "id";

    const cacheKey = `employees_${page}_${limit}_${search}_${department}_${sort}`;

    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const offset = (page - 1) * limit;

    let orderBy = "ep.id DESC";

    if (sort === "name") {
      orderBy = "ep.name ASC";
    }

    if (sort === "salary") {
      orderBy = "ep.salary DESC";
    }

    console.log("Fetching From Database");

    const employees = await pool.query(
      `
      SELECT
        ep.id,
        ep.user_id,
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
      WHERE ep.name ILIKE $1
      AND d.department_name ILIKE $2
      ORDER BY ${orderBy}
      LIMIT $3 OFFSET $4
      `,
      [`%${search}%`, `%${department}%`, limit, offset],
    );

    const total = await pool.query(
      `
      SELECT COUNT(*)
      FROM employee_profiles ep
      LEFT JOIN departments d
      ON ep.department_id = d.id
      WHERE ep.name ILIKE $1
      AND d.department_name ILIKE $2
      `,
      [`%${search}%`, `%${department}%`],
    );

    const responseData = {
      currentPage: page,
      search,
      department,
      sort,
      totalEmployees: Number(total.rows[0].count),
      totalPages: Math.ceil(Number(total.rows[0].count) / limit),
      employees: employees.rows,
    };

    cache.set(cacheKey, responseData);

    res.json(responseData);
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
      `
      SELECT
        ep.id,
        ep.name,
        ep.phone,
        ep.address,
        ep.designation,
        ep.salary,
        d.department_name
      FROM employee_profiles ep
      LEFT JOIN departments d
      ON ep.department_id = d.id
      WHERE ep.id = $1
      `,
      [id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getEmployeeByName = async (req, res) => {
  try {
    const { name } = req.params;

    const result = await pool.query(
      `
      SELECT
        ep.*,
        d.department_name
      FROM employee_profiles ep
      LEFT JOIN departments d
      ON ep.department_id = d.id
      WHERE ep.name = $1
      `,
      [name],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

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

    cache.flushAll();
    await logAction(
      req.user?.id || 1,
      "Employee Deleted",
      `Employee ID ${id} was deleted`,
    );
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
  getEmployeeByName,
  assignSkills,
  getEmployeeDepartment,
  getEmployeeSkills,
  uploadFiles,
  deleteEmployee,
  updateEmployee,
};
