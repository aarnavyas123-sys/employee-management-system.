const pool = require("../config/db");

// Allocate Asset
const allocateAsset = async (req, res) => {
  try {
    const { asset_id, employee_id, allocated_by } = req.body;

    // Create Allocation
    const allocation = await pool.query(
      `
      INSERT INTO asset_allocations
      (
        asset_id,
        employee_id,
        allocated_by,
        allocated_date,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        CURRENT_DATE,
        'Allocated'
      )
      RETURNING *
      `,
      [asset_id, employee_id, allocated_by],
    );

    // Update Asset Status
    await pool.query(
      `
      UPDATE assets
      SET status = 'Allocated'
      WHERE id = $1
      `,
      [asset_id],
    );

    // Asset History
    await pool.query(
      `
      INSERT INTO asset_history
      (
        asset_id,
        action,
        remarks,
        created_by,
        created_at
      )
      VALUES
      (
        $1,
        'Asset Allocated',
        'Asset assigned to employee',
        $2,
        CURRENT_TIMESTAMP
      )
      `,
      [asset_id, allocated_by],
    );

    // Notification
    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        is_read,
        created_at
      )
      VALUES
      (
        $1,
        'Asset Assigned',
        'A company asset has been assigned to you.',
        false,
        CURRENT_TIMESTAMP
      )
      `,
      [employee_id],
    );

    // Audit Log
    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        details
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      `,
      [
        allocated_by,
        "Asset Allocated",
        `Asset ID ${asset_id} assigned to Employee ${employee_id}`,
      ],
    );

    res.status(201).json(allocation.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Allocations
const getAllocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        aa.*,
        a.asset_name,
        a.asset_type,
        ep.name AS employee_name

      FROM asset_allocations aa

      JOIN assets a
      ON aa.asset_id = a.id

      JOIN employee_profiles ep
      ON aa.employee_id = ep.id

      ORDER BY aa.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  allocateAsset,
  getAllocations,
};
