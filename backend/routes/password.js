const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = uuidv4();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
        INSERT INTO password_reset
        (user_id, token, expires_at)
        VALUES($1,$2,$3)
        `,
      [user.rows[0].id, token, expiresAt],
    );

    res.json({
      message: "Reset token generated",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
