const express = require("express");
const router = express.Router();

const {
  employeeReport,
  leaveReport,
  assetReport,
} = require("../controllers/reportController");

router.get("/employees", employeeReport);
router.get("/leaves", leaveReport);
router.get("/assets", assetReport);

module.exports = router;
