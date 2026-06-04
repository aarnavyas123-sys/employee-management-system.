const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const auth = require("../middleware/auth");

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await pool.query(
      `
        SELECT
        id,
        name,
        email,
        role
        FROM users
        WHERE id=$1
        `,
      [req.user.id],
    );

    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
