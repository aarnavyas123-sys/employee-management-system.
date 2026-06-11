const express = require("express");
const router = express.Router();

const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/test", (req, res) => {
  res.json({
    message: "Password Route Working",
  });
});

module.exports = router;
