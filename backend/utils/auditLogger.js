const pool = require("../config/db");

const logAction = async (userId, action, details) => {
  try {
    console.log("AUDIT LOG:", userId, action, details);

    await pool.query(
      `
      INSERT INTO audit_logs(user_id, action, details)
      VALUES($1,$2,$3)
      `,
      [userId, action, details],
    );

    console.log("AUDIT INSERTED");
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
};

module.exports = logAction;
