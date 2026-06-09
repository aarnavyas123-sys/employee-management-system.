const pool = require("../config/db");

// Get All Assets
const getAssets = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM assets ORDER BY id DESC");

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Asset
const addAsset = async (req, res) => {
  try {
    const {
      asset_code,
      asset_name,
      asset_type,
      purchase_date,
      purchase_cost,
      status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO assets
      (asset_code,asset_name,asset_type,purchase_date,purchase_cost,status)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        asset_code,
        asset_name,
        asset_type,
        purchase_date,
        purchase_cost,
        status,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAssets,
  addAsset,
};
