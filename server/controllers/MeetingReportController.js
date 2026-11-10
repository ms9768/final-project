
const mongoose = require("mongoose");

const MeetingReport = require("../models/MeetingReport");
const SystemSettings = require("../models/SystemSettings");
const Group = require("../models/Group");

const ALLOWED_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "needs_correction",
];

// קבלת הגדרות המערכת
async function getSettings() {
  let settings = await SystemSettings.findOne();

  if (!settings) {
    settings = await SystemSettings.create({});
  }

  return settings;
}

// קבלת כל הדיווחים
const getMeetingReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "סטטוס לא תקין",
        });
      }

      filter.status = status;
    }

    const reports = await MeetingReport.find(filter)
      .select("-receipt.data")
      .populate("groupId")
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      message: "שגיאה בטעינת הדיווחים",
    });
  }
};

// יצירת דיווח פגישה
const createMeetingReport = async (req, res) => {
  try {
    const {
      groupId,
      meetingDate,
      topic,
      participantCount,
      refreshmentsCost,
    } = req.body;

    if (
      !groupId ||
      !meetingDate ||
      !topic ||
      participantCount === undefined
    ) {
      return res.status(400).json({
        message: "יש למלא את כל שדות החובה",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "מזהה קבוצה לא תקין",
      });
    }

    if (
      !Number.isInteger(Number(participantCount)) ||
      Number(participantCount) < 0
    ) {
      return res.status(400).json({
        message: "מספר המשתתפים אינו תקין",
      });
    }

    const cost = Number(refreshmentsCost || 0);

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({
        message: "עלות הכיבוד אינה תקינה",
      });
    }

    const date = new Date(meetingDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "תאריך הפגישה אינו תקין",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "הקבוצה לא נמצאה",
      });
    }

    const settings = await getSettings();
    const count = Number(participantCount);

    const refreshmentsBudget =
      count * settings.refreshmentsBudgetPerParticipant;

    const isRefreshmentsOverBudget =
      cost > refreshmentsBudget;

    const report = await MeetingReport.create({
      groupId,
      meetingDate: date,
      topic: topic.trim(),
      participantCount: count,
      refreshmentsCost: cost,
      refreshmentsBudget,
      isRefreshmentsOverBudget,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          coordinatorNotes: "",
          changedBy: null,
          changedAt: new Date(),
        },
      ],
    });

    return res.status(201).json({
      report,
      budgetWarning: isRefreshmentsOverBudget,
      message: isRefreshmentsOverBudget
        ? "הדיווח נשמר, אך תקציב הכיבוד חרג מהמותר"
        : "הדיווח נשמר בהצלחה",
    });
  } catch (error) {
    console.error("Create report error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "נתוני הדיווח אינם תקינים",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "שגיאה ביצירת הדיווח",
    });
  }
};

// עדכון סטטוס דיווח על ידי הרכזת
const updateMeetingReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, coordinatorNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "סטטוס לא תקין",
      });
    }

    const report = await MeetingReport.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "הדיווח לא נמצא",
      });
    }

    const notes =
      coordinatorNotes === undefined
        ? report.coordinatorNotes
        : String(coordinatorNotes).trim();

    report.status = status;
    report.coordinatorNotes = notes;

    // שמירת היסטוריית שינוי הסטטוס
    report.statusHistory.push({
      status,
      coordinatorNotes: notes,
      changedBy:
        req.user?._id ||
        req.user?.userId ||
        null,
      changedAt: new Date(),
    });

    await report.save();

    return res.status(200).json({
      message: "סטטוס הדיווח עודכן בהצלחה",
      report,
    });
  } catch (error) {
    console.error("Update status error:", error);

    return res.status(500).json({
      message: "שגיאה בעדכון סטטוס הדיווח",
    });
  }
};

// קבלת דיווח לפי מזהה
const getMeetingReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

const report = await MeetingReport.findById(id)
  .select("-receipt.data")
  .populate("groupId")
  .populate("statusHistory.changedBy", "fullName email");
    if (!report) {
      return res.status(404).json({
        message: "הדיווח לא נמצא",
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Get report error:", error);

    return res.status(500).json({
      message: "שגיאה בקבלת הדיווח",
    });
  }
};

// העלאת קבלה
const uploadMeetingReportReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "לא נבחר קובץ קבלה",
      });
    }

    const report = await MeetingReport.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "הדיווח לא נמצא",
      });
    }

    report.receipt = {
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
    };

    await report.save();

    return res.status(200).json({
      message: "הקבלה נשמרה בהצלחה",
      receipt: {
        fileName: report.receipt.fileName,
        contentType: report.receipt.contentType,
      },
    });
  } catch (error) {
    console.error("Upload receipt error:", error);

    return res.status(500).json({
      message: "שגיאה בשמירת הקבלה",
    });
  }
};

// הצגת או הורדת קבלה
const getMeetingReportReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

    const report = await MeetingReport.findById(id);

    if (!report || !report.receipt?.data) {
      return res.status(404).json({
        message: "לא נמצאה קבלה לדיווח",
      });
    }

    res.setHeader(
      "Content-Type",
      report.receipt.contentType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(
        report.receipt.fileName
      )}"`
    );

    return res.send(report.receipt.data);
  } catch (error) {
    console.error("Get receipt error:", error);

    return res.status(500).json({
      message: "שגיאה בהצגת הקבלה",
    });
  }
};

// חישוב תשלום למנחה
const getLecturerPayment = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lecturerId)) {
      return res.status(400).json({
        message: "מזהה מנחה לא תקין",
      });
    }

    const groups = await Group.find({ lecturerId });
    const groupIds = groups.map((group) => group._id);

    const approvedReports = await MeetingReport.find({
      groupId: { $in: groupIds },
      status: "approved",
    });

    const settings = await getSettings();

    const paymentPerMeeting =
      settings.facilitatorPaymentPerMeeting;

    const totalPayment =
      approvedReports.length * paymentPerMeeting;

    return res.status(200).json({
      lecturerId,
      approvedMeetingsCount: approvedReports.length,
      paymentPerMeeting,
      totalPayment,
    });
  } catch (error) {
    console.error("Lecturer payment error:", error);

    return res.status(500).json({
      message: "שגיאה בחישוב התשלום למנחה",
    });
  }
};

// חישוב תשלומים לכל המנחים
const getAllLecturersPayments = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("lecturerId", "fullName email");

    const settings = await getSettings();

    const paymentPerMeeting =
      settings.facilitatorPaymentPerMeeting;

    const lecturersMap = new Map();

    for (const group of groups) {
      if (!group.lecturerId) {
        continue;
      }

      const lecturerId = group.lecturerId._id.toString();

      if (!lecturersMap.has(lecturerId)) {
        lecturersMap.set(lecturerId, {
          lecturerId,
          lecturerName: group.lecturerId.fullName,
          email: group.lecturerId.email,
          groupIds: [],
        });
      }

      lecturersMap.get(lecturerId).groupIds.push(group._id);
    }

    const payments = await Promise.all(
      Array.from(lecturersMap.values()).map(
        async (lecturer) => {
          const approvedMeetingsCount =
            await MeetingReport.countDocuments({
              groupId: { $in: lecturer.groupIds },
              status: "approved",
            });

          return {
            lecturerId: lecturer.lecturerId,
            lecturerName: lecturer.lecturerName,
            email: lecturer.email,
            approvedMeetingsCount,
            paymentPerMeeting,
            totalPayment:
              approvedMeetingsCount * paymentPerMeeting,
          };
        }
      )
    );

    return res.status(200).json(payments);
  } catch (error) {
    console.error("All lecturers payments error:", error);

    return res.status(500).json({
      message: "שגיאה בחישוב התשלומים",
    });
  }
};

// עדכון פרטי דיווח קיים על ידי המנחה
const updateMeetingReport = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      groupId,
      meetingDate,
      topic,
      participantCount,
      refreshmentsCost,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

    if (
      !groupId ||
      !meetingDate ||
      !topic ||
      participantCount === undefined
    ) {
      return res.status(400).json({
        message: "יש למלא את כל שדות החובה",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "מזהה קבוצה לא תקין",
      });
    }

    const count = Number(participantCount);
    const cost = Number(refreshmentsCost || 0);
    const date = new Date(meetingDate);

    if (
      !Number.isInteger(count) ||
      count < 0 ||
      !Number.isFinite(cost) ||
      cost < 0 ||
      Number.isNaN(date.getTime()) ||
      !topic.trim()
    ) {
      return res.status(400).json({
        message: "אחד או יותר מהנתונים אינם תקינים",
      });
    }

    const report = await MeetingReport.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "הדיווח לא נמצא",
      });
    }

    // ניתן לערוך רק דיווח שממתין לאישור או שנדרש בו תיקון
    if (
      report.status !== "pending" &&
      report.status !== "needs_correction"
    ) {
      return res.status(400).json({
        message: "לא ניתן לערוך דיווח בסטטוס הנוכחי",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "הקבוצה לא נמצאה",
      });
    }

    const settings = await getSettings();

    const refreshmentsBudget =
      count * settings.refreshmentsBudgetPerParticipant;

    const isRefreshmentsOverBudget =
      cost > refreshmentsBudget;

    report.groupId = groupId;
    report.meetingDate = date;
    report.topic = topic.trim();
    report.participantCount = count;
    report.refreshmentsCost = cost;
    report.refreshmentsBudget = refreshmentsBudget;
    report.isRefreshmentsOverBudget =
      isRefreshmentsOverBudget;

    // אם הדיווח הוחזר לתיקון, הוא חוזר להמתנה לאישור
    if (report.status === "needs_correction") {
      report.status = "pending";
      report.coordinatorNotes = "";

      report.statusHistory.push({
        status: "pending",
        coordinatorNotes: "",
        changedBy: req.user?._id || null,
        changedAt: new Date(),
      });
    } else {
      // תיעוד עריכה רגילה של דיווח שממתין לאישור
      report.statusHistory.push({
        status: "pending",
        coordinatorNotes: "המנחה עדכן את פרטי הדיווח",
        changedBy: req.user?._id || null,
        changedAt: new Date(),
      });
    }

    await report.save();

    return res.status(200).json({
      message: "הדיווח עודכן בהצלחה",
      report,
      budgetWarning: isRefreshmentsOverBudget,
    });
  } catch (error) {
    console.error("Update report error:", error);

    return res.status(500).json({
      message: "שגיאה בעדכון הדיווח",
    });
  }
};

// ייצוא הפונקציות לשימוש בנתיבים
module.exports = {
  getMeetingReports,
  createMeetingReport,
  updateMeetingReport,
  updateMeetingReportStatus,
  getMeetingReportById,
  getMeetingReportReceipt,
  getLecturerPayment,
  getAllLecturersPayments,
  uploadMeetingReportReceipt,
};
module.exports = {
  getMeetingReports,
  createMeetingReport,
  updateMeetingReport,
  updateMeetingReportStatus,
  getMeetingReportById,
  getMeetingReportReceipt,
  getLecturerPayment,
  getAllLecturersPayments,
  uploadMeetingReportReceipt,
};
