const pool = require("../config/db");
const logger = require("../config/logger");

const logAction = async (userId, action, details) => {
  try {
    logger.info(`AUDIT LOG: user_id=${userId}, action=${action}, details=${details}`);

    await pool.query(
      `
      INSERT INTO audit_logs(user_id, action, details)
      VALUES($1,$2,$3)
      `,
      [userId, action, details],
    );

    logger.info("AUDIT INSERTED");
  } catch (error) {
    logger.error(`Audit Log Error: ${error.message}`);
  }
};

module.exports = logAction;
