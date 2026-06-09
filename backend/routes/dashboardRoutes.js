const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getDepartmentChart,
  getLeaveStatusChart,
  getAssetChart,
} = require("../controllers/dashboardController");

router.get("/", getDashboardStats);

router.get("/department-chart", getDepartmentChart);

router.get("/leave-chart", getLeaveStatusChart);

router.get("/asset-chart", getAssetChart);

module.exports = router;
