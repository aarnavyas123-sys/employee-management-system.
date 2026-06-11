const pool = require("../config/db");

// ==========================================================================
// 1. GET LOGGED-IN USER'S NOTIFICATIONS (Filtered by User ID & Status Count)
// ==========================================================================
const getNotifications = async (req, res) => {
  try {
    // 🛡️ Security Guardrail: Extract user context safely from authMiddleware
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: Missing active user profile token context",
        });
    }

    // Filter by individual user context or global context for HR, Manager, and Admin
    const result = await pool.query(
      `
      SELECT id, title, message, is_read, created_at 
      FROM notifications 
      WHERE user_id = $1 OR (user_id IS NULL AND $2 IN ('Admin', 'HR', 'Manager'))
      ORDER BY created_at DESC
      `,
      [userId, req.user?.role],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("NOTIFICATION FETCH ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================================================
// 2. MARK ALL UNREAD NOTIFICATIONS AS READ FOR THE ACTIVE SESSION
// ==========================================================================
const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized profile context" });
    }

    await pool.query(
      `
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
      `,
      [userId],
    );

    res.json({
      message:
        "All system notification nodes flags flipped to read status successfully ✅",
    });
  } catch (error) {
    console.error("NOTIFICATION MARK READ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead,
};
