const pool = require("../config/db");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const logger = require("../config/logger");

const forgotPassword = async (req, res) => {
  try {
    logger.info("Forgot Password Called");

    const { email } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [
      token,
      email,
    ]);

    res.json({
      message: "Reset token generated",
      token,
    });
  } catch (error) {
    logger.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1",
      [token],
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid Token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           reset_token = NULL
       WHERE reset_token = $2`,
      [hashedPassword, token],
    );

    res.json({
      message: "Password Reset Successfully",
    });
  } catch (error) {
    logger.error(`Reset Password Error: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
