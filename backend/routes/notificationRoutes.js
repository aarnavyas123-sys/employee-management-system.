const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // 📑 Security protection path layer inject ki

const {
  getNotifications,
  markNotificationsAsRead,
} = require("../controllers/notificationController");

// Secure routing lanes configuration
router.get("/", authMiddleware, getNotifications);
router.put("/mark-read", authMiddleware, markNotificationsAsRead); // 📑 Naya endpoint wired up completely

module.exports = router;
