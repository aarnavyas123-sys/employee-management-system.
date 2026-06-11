const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAttendanceHistory,
} = require("../controllers/attendanceController");

router.post("/clock-in", authMiddleware, clockIn);
router.post("/clock-out", authMiddleware, clockOut);
router.get("/today", authMiddleware, getTodayAttendance);
router.get("/history", authMiddleware, getAttendanceHistory);

module.exports = router;
