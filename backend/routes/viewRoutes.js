const express = require("express");
const router = express.Router();

const { getEmployeeView } = require("../controllers/viewController");

router.get("/", getEmployeeView);

module.exports = router;
