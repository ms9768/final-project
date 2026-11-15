
const express = require("express");

const {
  getMeetingReports,
  createMeetingReport,
  updateMeetingReportStatus,
  updateMeetingReportPaymentStatus,
  getMeetingReportById,
  updateMeetingReport,
  getLecturerPayment,
  getMeetingReportReceipt,
  getAllLecturersPayments,
  uploadMeetingReportReceipt,
} = require("../controllers/MeetingReportController");

const uploadReceipt = require("../middleware/uploadReceipt");

const {
  authenticateToken,
  requirePaymentManager,
} = require("../middleware/authMiddleware");

const router = express.Router();

// כל הנתיבים מחייבים משתמשת מחוברת
router.use(authenticateToken);

router.get("/", getMeetingReports);
router.post("/", createMeetingReport);

// קבלת תשלומים
router.get("/lecturers/payments", getAllLecturersPayments);
router.get("/lecturer/:lecturerId/payment", getLecturerPayment);

// עדכון סטטוס דיווח
router.patch("/:id/status", updateMeetingReportStatus);

// עדכון מצב תשלום
router.patch(
  "/:id/payment-status",
  requirePaymentManager,
  updateMeetingReportPaymentStatus
);

// העלאת קבלה
router.post(
  "/:id/receipt",
  uploadReceipt.single("receipt"),
  uploadMeetingReportReceipt
);

router.put("/:id", updateMeetingReport);

router.get("/:id/receipt", getMeetingReportReceipt);
router.get("/:id", getMeetingReportById);

module.exports = router;
