const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// ==========================================================================
// Deconstruct carefully from authController module exports
// ==========================================================================
const {
  signup,
  login,
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getAdminAnalytics, // 👈 Explicit destructuring hook check
} = require("../controllers/authController");

// Public Authentication Routes
router.post("/signup", signup);
router.post("/login", login);

// Admin Only - User Access Management Endpoints
router.post("/create-user", authMiddleware, createUser);
router.get("/users", authMiddleware, getUsers);
router.put("/users/:id/role", authMiddleware, updateUserRole);
router.put("/users/:id/status", authMiddleware, updateUserStatus);

// 🛠️ Line 22 validation check point
// Is endpoint par variables sequence check karo: path string -> middleware -> handler function
router.get("/admin/analytics", authMiddleware, getAdminAnalytics);

module.exports = router;
