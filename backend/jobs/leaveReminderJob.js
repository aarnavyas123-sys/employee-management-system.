const cron = require("node-cron");
const pool = require("../config/db");
const logAction = require("../utils/auditLogger");

const startLeaveReminderJob = () => {
  console.log("✅ Leave Reminder Job Started");

  cron.schedule("*/30 * * * * *", async () => {
    try {
      console.log("🔄 Running Leave Reminder Job");

      const result = await pool.query(`
        SELECT COUNT(*) AS pending_count
        FROM leave_applications
        WHERE status = 'Pending'
      `);

      const pendingCount = Number(result.rows[0].pending_count);

      console.log(`📌 Pending Leave Requests: ${pendingCount}`);

      if (pendingCount > 0) {
        // Notification
        await pool.query(
          `
          INSERT INTO notifications(title, message)
          VALUES($1,$2)
          `,
          [
            "Pending Leave Requests",
            `${pendingCount} leave requests are awaiting approval`,
          ],
        );

        // Audit Log
        await logAction(
          1,
          "Cron Job Executed",
          `${pendingCount} pending leave requests checked`,
        );

        console.log("✅ Notification Created");
        console.log("✅ Audit Log Created");
      }
    } catch (error) {
      console.error("Cron Job Error:", error.message);
    }
  });
};

module.exports = startLeaveReminderJob;
