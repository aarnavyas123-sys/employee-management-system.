const express = require("express");
const router = express.Router();

const {
  allocateAsset,
  getAllocations,
} = require("../controllers/assetAllocationController");

router.get("/", getAllocations);
router.post("/", allocateAsset);

module.exports = router;
