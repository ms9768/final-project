const express = require("express");

const {
  exportPaymentWorkbook,
  getPaymentFacilitators,
  getPaymentReports,
} = require("../controllers/PaymentManagementController");
const {
  authenticateToken,
  requirePaymentManager,
} = require("../middleware/authMiddleware");
const {
  updateMeetingReportPaymentStatus,
} = require("../controllers/MeetingReportController");

const router = express.Router();

router.use(authenticateToken, requirePaymentManager);

router.get("/facilitators", getPaymentFacilitators);
router.get("/reports", getPaymentReports);
router.get("/export", exportPaymentWorkbook);
router.patch("/reports/:id/paid", updateMeetingReportPaymentStatus);

module.exports = router;
