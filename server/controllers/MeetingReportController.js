
const mongoose = require("mongoose");

const MeetingReport = require("../models/MeetingReport");
const SystemSettings = require("../models/SystemSettings");
const Group = require("../models/Group");
const User = require("../models/User");
const {
  markApprovedReportPaid,
} = require("../services/paymentProcessingService");

const ALLOWED_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "needs_correction",
];

function getUserId(req) {
  return req.user?.userId || req.user?._id;
}

async function getSettings() {
  let settings = await SystemSettings.findOne();

  if (!settings) {
    settings = await SystemSettings.create({});
  }

  return settings;
}

// מציאת קבוצה קיימת או יצירת קבוצה חדשה
async function getOrCreateGroup({
  lecturerId,
  schoolName,
  className,
  groupNumber,
}) {
  let group = await Group.findOne({
    lecturerId,
    schoolName,
    className,
    groupNumber,
  });

  if (!group) {
    group = await Group.create({
      name: `${schoolName} - ${className} - קבוצה ${groupNumber}`,
      schoolName,
      className,
      groupNumber,
      lecturerId,
    });
  }

  return group;
}

// בדיקת הרשאה לצפייה או לעריכת דיווח
function canAccessReport(report, req) {
  const userId = getUserId(req);

  if (!userId) return false;

  if (req.user.role === "coordinator") {
    return report.coordinatorId?.toString() === userId.toString();
  }

  if (req.user.role === "facilitator") {
    const facilitatorId =
      report.facilitatorId?._id || report.facilitatorId;

    return facilitatorId?.toString() === userId.toString();
  }

  return false;
}


// חישוב סכום התשלום עבור דיווח
async function calculateReportPayment(report) {
  const facilitatorId =
    report.facilitatorId?._id || report.facilitatorId;

  const facilitator = await User.findById(facilitatorId);

  if (!facilitator) {
    throw new Error("המנחה לא נמצאה");
  }

  const settings = await getSettings();

  let facilitatorPayment = 0;
  let prolongedConversationBonus = 0;

  if (facilitator.facilitatorLevel === "young") {
    facilitatorPayment =
      settings.youngFacilitatorPaymentPerMeeting || 0;
  } else if (facilitator.facilitatorLevel === "senior") {
    facilitatorPayment =
      settings.seniorFacilitatorPaymentPerMeeting || 0;

    if (report.prolongedConversation === true) {
      prolongedConversationBonus =
        settings.seniorProlongedConversationBonus || 0;
    }
  } else {
    throw new Error("לא הוגדר סוג מנחה");
  }

  // שכירות מתווספת לכל פגישה
  const rentalPayment =
    settings.rentalPaymentPerMeeting || 0;

  report.paymentAmount =
    facilitatorPayment +
    prolongedConversationBonus +
    rentalPayment;

  // תיקון ערך תשלום לא חוקי שנשמר בעבר
  if (!["not_started", "paid"].includes(report.paymentStatus)) {
    report.paymentStatus = "not_started";
  }
}


// קבלת דיווחים
const getMeetingReports = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({
        message: "המשתמשת אינה מזוהה",
      });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "סטטוס לא תקין",
      });
    }

    const filter = {};

    if (req.user.role === "facilitator") {
      filter.facilitatorId = userId;
    } else if (req.user.role === "coordinator") {
      filter.coordinatorId = userId;
    } else {
      return res.status(403).json({
        message: "אין הרשאה לצפות בדיווחים",
      });
    }

    if (status) {
      filter.status = status;
    }

    const reports = await MeetingReport.find(filter)
      .select("-receipt.data")
      .populate("groupId")
      .populate("facilitatorId", "fullName email facilitatorLevel")
      .sort({ createdAt: -1 });

    // תיקון דיווחים ישנים שאושרו ונשמרו עם סכום אפס
    for (const report of reports) {
      if (
        report.status === "approved" &&
        Number(report.paymentAmount || 0) === 0
      ) {
        await calculateReportPayment(report);
        await report.save();
      }
    }

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
      schoolName,
      className,
      groupNumber,
      meetingDate,
      topic,
      participantCount,
      refreshmentsCost,
      meetingLocation,
      prolongedConversation,
    } = req.body;

    if (
      !schoolName?.trim() ||
      !className?.trim() ||
      ![1, 2, 3].includes(Number(groupNumber)) ||
      !meetingDate ||
      !topic?.trim() ||
      participantCount === undefined ||
      !meetingLocation
    ) {
      return res.status(400).json({
        message: "יש למלא את כל שדות החובה",
      });
    }

    if (
      !["facilitator_home", "organization_venue"].includes(
        meetingLocation
      )
    ) {
      return res.status(400).json({
        message: "מקום הפגישה אינו תקין",
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
      Number.isNaN(date.getTime())
    ) {
      return res.status(400).json({
        message: "אחד או יותר מהנתונים אינם תקינים",
      });
    }

    const facilitator = await User.findById(getUserId(req));

    if (!facilitator || facilitator.role !== "facilitator") {
      return res.status(403).json({
        message: "רק מנחה יכולה לדווח על פגישה",
      });
    }

    if (!facilitator.coordinatorId) {
      return res.status(400).json({
        message: "לא משויכת רכזת למנחה",
      });
    }

    const group = await getOrCreateGroup({
      lecturerId: facilitator._id,
      schoolName: schoolName.trim(),
      className: className.trim(),
      groupNumber: Number(groupNumber),
    });

    const hasProlongedConversation =
      facilitator.facilitatorLevel === "senior" &&
      prolongedConversation === true;

    const settings = await getSettings();

    const refreshmentsBudget =
      count * settings.refreshmentsBudgetPerParticipant;

    const isRefreshmentsOverBudget =
      cost > refreshmentsBudget;

    const report = await MeetingReport.create({
      groupId: group._id,
      schoolName: schoolName.trim(),
      className: className.trim(),
      groupNumber: Number(groupNumber),
      facilitatorId: facilitator._id,
      coordinatorId: facilitator.coordinatorId,
      meetingDate: date,
      topic: topic.trim(),
      participantCount: count,
      meetingLocation,
      prolongedConversation: hasProlongedConversation,
      refreshmentsCost: cost,
      refreshmentsBudget,
      isRefreshmentsOverBudget,
      status: "pending",
      paymentStatus: "not_started",
      paymentAmount: 0,
      statusHistory: [
        {
          status: "pending",
          coordinatorNotes: "",
          changedBy: facilitator._id,
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

    if (req.user.role !== "coordinator") {
      return res.status(403).json({
        message: "רק רכזת יכולה לעדכן סטטוס דיווח",
      });
    }

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

    if (!canAccessReport(report, req)) {
      return res.status(403).json({
        message: "אין הרשאה לעדכן את הדיווח",
      });
    }

    // לא ניתן לאשר הוצאות כיבוד ללא קבלה
    if (
      status === "approved" &&
      Number(report.refreshmentsCost) > 0 &&
      !report.receipt?.data
    ) {
      return res.status(400).json({
        message: "לא ניתן לאשר דיווח הכולל הוצאות כיבוד ללא קבלה",
      });
    }

    // לא מאפשרים לבטל דיווח שכבר שולם
    if (
      report.paymentStatus === "paid" &&
      status !== "approved"
    ) {
      return res.status(400).json({
        message: "לא ניתן לשנות סטטוס של דיווח שכבר שולם",
      });
    }

    const notes =
      coordinatorNotes === undefined
        ? report.coordinatorNotes
        : String(coordinatorNotes).trim();

    // מחשבים תשלום כאשר הדיווח מאושר לראשונה
    if (status === "approved") {
      if (report.status !== "approved") {
        await calculateReportPayment(report);
        report.paymentStatus = "not_started";
        report.paymentDate = null;
        report.paidBy = null;
      }
    } else {
      report.paymentAmount = 0;
      report.paymentStatus = "not_started";
      report.paymentDate = null;
      report.paidBy = null;
    }

    report.status = status;
    report.coordinatorNotes = notes;

    report.statusHistory.push({
      status,
      coordinatorNotes: notes,
      changedBy: getUserId(req),
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

// סימון דיווח מאושר כשולם על ידי מנהלת התשלומים
const updateMeetingReportPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "payment_manager") {
      return res.status(403).json({
        message: "רק מנהלת התשלומים יכולה לסמן דיווח כשולם",
      });
    }

    if (req.body && Object.keys(req.body).length > 0) {
      return res.status(400).json({
        message: "בקשת סימון התשלום אינה תקינה",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

    const report = await markApprovedReportPaid({
      reportId: id,
      paymentManagerId: getUserId(req),
    });

    if (!report) {
      const exists = await MeetingReport.exists({ _id: id });
      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "אפשר לסמן רק דיווח מאושר שטרם שולם"
          : "הדיווח לא נמצא",
      });
    }

    return res.status(200).json({
      message: "הדיווח סומן כשולם בהצלחה",
      report: {
        _id: report._id,
        paymentStatus: report.paymentStatus,
        paymentDate: report.paymentDate,
        paidBy: report.paidBy,
      },
    });
  } catch {
    console.error("Mark report paid failed");

    return res.status(500).json({
      message: "לא ניתן לסמן את הדיווח כשולם",
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
      .populate("facilitatorId", "fullName email facilitatorLevel")
      .populate("statusHistory.changedBy", "fullName email");

    if (!report) {
      return res.status(404).json({
        message: "הדיווח לא נמצא",
      });
    }

    if (!canAccessReport(report, req)) {
      return res.status(403).json({
        message: "אין הרשאה לצפות בדיווח",
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

    if (
      req.user.role !== "facilitator" ||
      !canAccessReport(report, req)
    ) {
      return res.status(403).json({
        message: "אין הרשאה להעלות קבלה לדיווח זה",
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

    if (!canAccessReport(report, req)) {
      return res.status(403).json({
        message: "אין הרשאה לצפות בקבלה",
      });
    }

    res.setHeader(
      "Content-Type",
      report.receipt.contentType || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(
        report.receipt.fileName || "receipt"
      )}`
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
    const userId = getUserId(req);

    if (!["facilitator", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({
        message: "אין הרשאה לצפות בנתוני התשלום",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lecturerId)) {
      return res.status(400).json({
        message: "מזהה מנחה לא תקין",
      });
    }

    const lecturer = await User.findById(lecturerId);

    if (!lecturer || lecturer.role !== "facilitator") {
      return res.status(404).json({
        message: "המנחה לא נמצאה",
      });
    }

    if (
      req.user.role === "facilitator" &&
      lecturer._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "אין הרשאה לצפות בתשלומים של מנחה אחרת",
      });
    }

    if (
      req.user.role === "coordinator" &&
      lecturer.coordinatorId?.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "המנחה אינה משויכת לרכזת זו",
      });
    }

    if (!["young", "senior"].includes(lecturer.facilitatorLevel)) {
      return res.status(400).json({
        message: "לא הוגדר סוג מנחה למשתמשת",
      });
    }

    const groups = await Group.find({ lecturerId });
    const groupIds = groups.map((group) => group._id);

    const approvedReports = await MeetingReport.find({
      groupId: { $in: groupIds },
      facilitatorId: lecturerId,
      status: "approved",
    });

    const approvedMeetingsCount = approvedReports.length;

    const totalCombinedPayment = approvedReports.reduce(
      (sum, report) => sum + (Number(report.paymentAmount) || 0),
      0
    );

    return res.status(200).json({
      lecturerId,
      facilitatorLevel: lecturer.facilitatorLevel,
      approvedMeetingsCount,
      totalCombinedPayment,
      totalPayment: totalCombinedPayment,
    });
  } catch (error) {
    console.error("Lecturer payment error:", error);

    return res.status(500).json({
      message: "שגיאה בחישוב התשלום למנחה",
    });
  }
};

// חישוב תשלומים לכל המנחות של הרכזת
const getAllLecturersPayments = async (req, res) => {
  try {
    if (req.user.role !== "coordinator") {
      return res.status(403).json({
        message: "רק רכזת יכולה לצפות בתשלומי המנחות",
      });
    }

    const coordinatorId = getUserId(req);

    const lecturers = await User.find({
      role: "facilitator",
      coordinatorId,
    }).select("fullName email facilitatorLevel");

    const payments = await Promise.all(
      lecturers.map(async (lecturer) => {
        const approvedReports = await MeetingReport.find({
          facilitatorId: lecturer._id,
          coordinatorId,
          status: "approved",
        });

        const approvedMeetingsCount = approvedReports.length;

        const totalCombinedPayment = approvedReports.reduce(
          (sum, report) => sum + (Number(report.paymentAmount) || 0),
          0
        );

        return {
          lecturerId: lecturer._id,
          lecturerName: lecturer.fullName,
          email: lecturer.email,
          facilitatorLevel: lecturer.facilitatorLevel,
          approvedMeetingsCount,
          totalPayment: totalCombinedPayment,
          totalCombinedPayment,
        };
      })
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
      schoolName,
      className,
      groupNumber,
      meetingDate,
      topic,
      participantCount,
      refreshmentsCost,
      meetingLocation,
      prolongedConversation,
    } = req.body;

    if (req.user.role !== "facilitator") {
      return res.status(403).json({
        message: "רק מנחה יכולה לערוך דיווח",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "מזהה דיווח לא תקין",
      });
    }

    if (
      !schoolName?.trim() ||
      !className?.trim() ||
      ![1, 2, 3].includes(Number(groupNumber)) ||
      !meetingDate ||
      !topic?.trim() ||
      participantCount === undefined ||
      !meetingLocation
    ) {
      return res.status(400).json({
        message: "יש למלא את כל שדות החובה",
      });
    }

    if (
      !["facilitator_home", "organization_venue"].includes(
        meetingLocation
      )
    ) {
      return res.status(400).json({
        message: "מקום הפגישה אינו תקין",
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
      Number.isNaN(date.getTime())
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

    if (!canAccessReport(report, req)) {
      return res.status(403).json({
        message: "אין הרשאה לערוך דיווח זה",
      });
    }

    if (
      report.status !== "pending" &&
      report.status !== "needs_correction"
    ) {
      return res.status(400).json({
        message: "לא ניתן לערוך דיווח בסטטוס הנוכחי",
      });
    }

    const facilitator = await User.findById(getUserId(req));

    if (!facilitator) {
      return res.status(404).json({
        message: "המנחה לא נמצאה",
      });
    }

    const group = await getOrCreateGroup({
      lecturerId: facilitator._id,
      schoolName: schoolName.trim(),
      className: className.trim(),
      groupNumber: Number(groupNumber),
    });

    const settings = await getSettings();

    const refreshmentsBudget =
      count * settings.refreshmentsBudgetPerParticipant;

    const isRefreshmentsOverBudget =
      cost > refreshmentsBudget;

    report.groupId = group._id;
    report.schoolName = schoolName.trim();
    report.className = className.trim();
    report.groupNumber = Number(groupNumber);
    report.meetingDate = date;
    report.topic = topic.trim();
    report.participantCount = count;
    report.meetingLocation = meetingLocation;

    report.prolongedConversation =
      facilitator.facilitatorLevel === "senior" &&
      prolongedConversation === true;

    report.refreshmentsCost = cost;
    report.refreshmentsBudget = refreshmentsBudget;
    report.isRefreshmentsOverBudget = isRefreshmentsOverBudget;

    if (report.status === "needs_correction") {
      report.status = "pending";
      report.coordinatorNotes = "";

      report.statusHistory.push({
        status: "pending",
        coordinatorNotes: "",
        changedBy: getUserId(req),
        changedAt: new Date(),
      });
    } else {
      report.statusHistory.push({
        status: "pending",
        coordinatorNotes: "המנחה עדכנה את פרטי הדיווח",
        changedBy: getUserId(req),
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

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "נתוני הדיווח אינם תקינים",
      });
    }

    return res.status(500).json({
      message: "שגיאה בעדכון הדיווח",
    });
  }
};

module.exports = {
  getMeetingReports,
  createMeetingReport,
  updateMeetingReport,
  updateMeetingReportStatus,
  updateMeetingReportPaymentStatus,
  getMeetingReportById,
  getMeetingReportReceipt,
  getLecturerPayment,
  getAllLecturersPayments,
  uploadMeetingReportReceipt,
};
