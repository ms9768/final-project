const express = require("express");

const {
  getMeetingReports,
  createMeetingReport,
  updateMeetingReportStatus,
  getMeetingReportById,
  updateMeetingReport,
  getLecturerPayment,
  getMeetingReportReceipt,
  getAllLecturersPayments,
  uploadMeetingReportReceipt,
} = require("../controllers/MeetingReportController");

const uploadReceipt = require("../middleware/uploadReceipt");

const router = express.Router();

router.get("/", getMeetingReports);
router.post("/", createMeetingReport);

// קבלת תשלומים של כל המנחות
router.get("/lecturers/payments", getAllLecturersPayments);

// קבלת תשלום של מנחה מסוימת
router.get("/lecturer/:lecturerId/payment", getLecturerPayment);

// עדכון סטטוס דיווח
router.patch("/:id/status", updateMeetingReportStatus);

// העלאת קבלה לדיווח קיים
router.post(
  "/:id/receipt",
  uploadReceipt.single("receipt"),
  uploadMeetingReportReceipt
);

router.put("/:id", updateMeetingReport);

router.get("/:id/receipt", getMeetingReportReceipt);

// קבלת דיווח יחיד לפי מזהה
router.get("/:id", getMeetingReportById);

module.exports = router;