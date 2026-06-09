const express = require("express");
const router = express.Router();

const {
  exportEmployees,
  exportLeaves,
  exportAssets,
} = require("../controllers/exportController");

router.get("/employees", exportEmployees);
router.get("/leaves", exportLeaves);
router.get("/assets", exportAssets);

module.exports = router;
