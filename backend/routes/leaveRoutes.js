const express = require("express");
const router = express.Router();

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

// Apply Leave
router.post("/", applyLeave);

// Get All Leave Requests
router.get("/", getLeaves);

// Approval History
router.get("/history", getApprovalHistory);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

// Approve Leave
router.put("/approve/:id", approveLeave);

// Reject Leave
router.put("/reject/:id", rejectLeave);

router.put("/hr-approve/:id", hrApproveLeave);
router.put("/hr-reject/:id", hrRejectLeave);
module.exports = router;
