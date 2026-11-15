
const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  requireCoordinator,
} = require("../middleware/authMiddleware");

const {
  createDelivery,
  getDeliveryByToken,
  confirmDelivery,
  markDeliveryOnTheWay,
  completeDelivery,
  getAllDeliveries,
  uploadDeliveryPhoto,
} = require("../controllers/DeliveryController");

// נתיבים מוגנים לרכזת
router.post(
  "/",
  authenticateToken,
  requireCoordinator,
  createDelivery
);

router.get(
  "/",
  authenticateToken,
  requireCoordinator,
  getAllDeliveries
);

// נתיבים אישיים למשלוחן באמצעות הקישור שבמייל
router.get("/public/:token", getDeliveryByToken);

router.patch("/public/:token/confirm", confirmDelivery);

router.patch("/public/:token/on-the-way", markDeliveryOnTheWay);

router.post(
  "/public/:token/complete",
  (req, res, next) => {
    uploadDeliveryPhoto(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
      next();
    });
  },
  completeDelivery
);

module.exports = router;
