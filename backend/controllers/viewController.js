const pool = require("../config/db");

const getEmployeeView = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employee_details_view ORDER BY id",
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getEmployeeView,
};
