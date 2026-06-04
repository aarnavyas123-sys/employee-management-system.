const express = require("express");
const router = express.Router();

const {
  getDepartments,
  createDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

router.get("/", getDepartments);
router.post("/", createDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;
