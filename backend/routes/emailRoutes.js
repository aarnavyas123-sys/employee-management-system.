const express = require("express");
const router = express.Router();

const sendEmail = require("../services/emailService");

router.get("/test", async (req, res) => {
  try {
    await sendEmail(
      "your-email@gmail.com",
      "EMS Test Email",
      "Email Notifications Working Successfully",
    );

    res.json({
      message: "Email Sent Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
