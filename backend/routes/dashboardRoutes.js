const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getDepartmentChart,
  getLeaveStatusChart,
} = require("../controllers/dashboardController");

router.get("/", getDashboardStats);

router.get("/department-chart", getDepartmentChart);

router.get("/leave-chart", getLeaveStatusChart);

module.exports = router;
