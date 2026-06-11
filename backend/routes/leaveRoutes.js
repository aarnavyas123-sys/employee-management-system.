const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // 📑 Added security middleware route injection

const {
  applyLeave,
  getLeaves,
  approveLeave,
  rejectLeave,
  getApprovalHistory,
  getAuditLogs,
  hrApproveLeave,
  hrRejectLeave,
} = require("../controllers/leaveController");

// Secure routing channels intercept configurations
router.post("/", authMiddleware, applyLeave);
router.get("/", authMiddleware, getLeaves);
router.get("/history", authMiddleware, getApprovalHistory);
router.get("/audit-logs", authMiddleware, getAuditLogs);

router.put("/approve/:id", authMiddleware, approveLeave);
router.put("/reject/:id", authMiddleware, rejectLeave);
router.put("/hr-approve/:id", authMiddleware, hrApproveLeave);
router.put("/hr-reject/:id", authMiddleware, hrRejectLeave);

module.exports = router;
