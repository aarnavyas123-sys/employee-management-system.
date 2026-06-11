const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const { employeeSchema } = require("../validations/employeeValidation");

const {
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
} = require("../controllers/employeeController");

// Create Employee
router.post("/", validate(employeeSchema), createEmployee);

// Get All Employees
router.get("/", getEmployees);

// Assign Skills
router.post("/assign-skills", assignSkills);

// JOIN: Employee + Department
router.get("/employee-department", getEmployeeDepartment);

// JOIN: Employee + Skills
router.get("/employee-skills", getEmployeeSkills);

router.post("/upload", upload.array("documents", 5), uploadFiles);

router.get("/profile/:name", getEmployeeByName);

// Get Employee By ID (KEEP THIS LAST)
router.get("/:id", getEmployeeById);

router.delete("/:id", deleteEmployee);

router.put("/:id", validate(employeeSchema), updateEmployee);
module.exports = router;
