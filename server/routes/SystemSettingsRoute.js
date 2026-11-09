
const express = require("express");

const {
  getSystemSettings,
  updateSystemSettings,
} = require("../controllers/SystemSettingsController");

const router = express.Router();

// קבלת הגדרות המערכת
router.get("/", getSystemSettings);

// עדכון הגדרות המערכת
router.patch("/", updateSystemSettings);

module.exports = router;
