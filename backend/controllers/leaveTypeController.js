const pool = require("../config/db");

const getLeaveTypes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leave_types ORDER BY id");

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getLeaveTypes,
};
