const express = require("express");
const router = express.Router();

const {
  getSkills,
  createSkill,
  deleteSkill,
} = require("../controllers/skillController");

router.get("/", getSkills);
router.post("/", createSkill);
router.delete("/:id", deleteSkill);

module.exports = router;
