const pool = require("../config/db");

const getSkills = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills ORDER BY id");

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createSkill = async (req, res) => {
  try {
    const { skill_name } = req.body;

    const result = await pool.query(
      `INSERT INTO skills(skill_name)
       VALUES($1)
       RETURNING *`,
      [skill_name],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM skills WHERE id=$1", [id]);

    res.json({
      message: "Skill Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  getSkills,
  createSkill,
  deleteSkill,
};
