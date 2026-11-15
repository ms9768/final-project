
const express = require("express");

const {
  getSystemSettings,
  updateSystemSettings,
} = require("../controllers/SystemSettingsController");

const {
  authenticateToken,
  requireCoordinator,
} = require("../middleware/authMiddleware");

const router = express.Router();

// קבלת הגדרות המערכת – למשתמשות מחוברות
router.get("/", authenticateToken, getSystemSettings);

// עדכון הגדרות המערכת – לרכזת בלבד
router.patch(
  "/",
  authenticateToken,
  requireCoordinator,
  updateSystemSettings
);

module.exports = router;
