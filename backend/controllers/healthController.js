const pool = require("../config/db");

const healthCheck = async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      status: "UP",
      database: "CONNECTED",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "DOWN",
      database: "DISCONNECTED",
      error: error.message,
    });
  }
};

module.exports = {
  healthCheck,
};
