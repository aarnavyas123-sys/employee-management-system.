const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  assignSkills,
  getEmployeeDepartment,
  getEmployeeSkills,
  uploadFiles,
  deleteEmployee,
} = require("../controllers/employeeController");

// Create Employee
router.post("/", createEmployee);

// Get All Employees
router.get("/", getEmployees);

// Assign Skills
router.post("/assign-skills", assignSkills);

// JOIN: Employee + Department
router.get("/employee-department", getEmployeeDepartment);

// JOIN: Employee + Skills
router.get("/employee-skills", getEmployeeSkills);

router.post("/upload", upload.array("documents", 5), uploadFiles);

// Get Employee By ID (KEEP THIS LAST)
router.get("/:id", getEmployeeById);

router.delete("/:id", deleteEmployee);

module.exports = router;
