const mongoose = require("mongoose");
const ExcelJS = require("exceljs");

const MeetingReport = require("../models/MeetingReport");
const User = require("../models/User");
const {
  decryptBankDetails,
} = require("../services/bankDetails");
const {
  groupReportsByFacilitatorId,
} = require("../services/paymentReportGrouping");

const PAYMENT_STATUSES = ["not_started", "paid"];
const BANK_DETAILS_STATUSES = ["not_submitted", "provided"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseDate(value) {
  if (!value) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("תאריך הסינון אינו תקין");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("תאריך הסינון אינו תקין");
  }

  return date;
}

function getDateRange(fromDate, toDate) {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);

  if (from && to && from > to) {
    throw new Error("טווח התאריכים אינו תקין");
  }

  const dateFilter = {};
  if (from) dateFilter.$gte = from;
  if (to) {
    dateFilter.$lt = new Date(to.getTime() + 24 * 60 * 60 * 1000);
  }

  return Object.keys(dateFilter).length ? dateFilter : null;
}

async function loadApprovedReports(filters) {
  const {
    fromDate,
    toDate,
    paymentStatus,
    bankDetailsStatus,
    facilitatorId,
  } = filters;

  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error("סטטוס התשלום אינו תקין");
  }
  if (
    bankDetailsStatus &&
    !BANK_DETAILS_STATUSES.includes(bankDetailsStatus)
  ) {
    throw new Error("סטטוס פרטי הבנק אינו תקין");
  }
  if (facilitatorId && !mongoose.Types.ObjectId.isValid(facilitatorId)) {
    throw new Error("מזהה מנחה אינו תקין");
  }

  const reportFilter = { status: "approved" };
  const dateRange = getDateRange(fromDate, toDate);
  if (dateRange) reportFilter.meetingDate = dateRange;
  if (paymentStatus) reportFilter.paymentStatus = paymentStatus;

  if (bankDetailsStatus || facilitatorId) {
    const userFilter = { role: "facilitator" };
    if (bankDetailsStatus) {
      if (bankDetailsStatus === "not_submitted") {
        userFilter.$or = [
          { bankDetailsStatus: "not_submitted" },
          { bankDetailsStatus: { $exists: false } },
        ];
      } else {
        userFilter.bankDetailsStatus = bankDetailsStatus;
      }
    }
    if (facilitatorId) userFilter._id = facilitatorId;

    const matchingFacilitators = await User.find(userFilter).select("_id");
    const facilitatorIds = matchingFacilitators.map((user) => user._id);
    if (facilitatorIds.length === 0) return [];

    reportFilter.facilitatorId = { $in: facilitatorIds };
  }

  return MeetingReport.find(reportFilter)
    .select(
      "facilitatorId groupId schoolName className groupNumber meetingDate topic paymentAmount paymentStatus paymentDate statusHistory.status statusHistory.changedAt"
    )
    .populate("facilitatorId", "fullName email bankDetailsStatus")
    .populate("groupId", "name schoolName")
    .sort({ meetingDate: -1, createdAt: -1 })
    .lean();
}

function toPaymentReport(report) {
  const approvalEvent = [...(report.statusHistory || [])]
    .reverse()
    .find((event) => event.status === "approved");

  return {
    _id: report._id,
    facilitatorId: report.facilitatorId,
    groupId: report.groupId,
    schoolName: report.schoolName,
    className: report.className,
    groupNumber: report.groupNumber,
    meetingDate: report.meetingDate,
    topic: report.topic,
    paymentAmount: Number(report.paymentAmount || 0),
    paymentStatus: report.paymentStatus,
    paymentDate: report.paymentDate,
    approvalDate: approvalEvent?.changedAt || null,
    bankDetailsStatus:
      report.facilitatorId?.bankDetailsStatus || "not_submitted",
  };
}

const getPaymentFacilitators = async (req, res) => {
  try {
    const facilitatorIds = await MeetingReport.distinct("facilitatorId", {
      status: "approved",
    });

    const facilitators = await User.find({
      _id: { $in: facilitatorIds },
      role: "facilitator",
    })
      .select("fullName email bankDetailsStatus")
      .sort({ fullName: 1, _id: 1 })
      .lean();

    return res.status(200).json(
      facilitators.map((facilitator) => ({
        ...facilitator,
        bankDetailsStatus:
          facilitator.bankDetailsStatus || "not_submitted",
      }))
    );
  } catch {
    console.error("Payment facilitator list failed");
    return res.status(500).json({
      message: "לא ניתן לטעון את רשימת המנחות",
    });
  }
};

const getPaymentReports = async (req, res) => {
  try {
    const reports = await loadApprovedReports(req.query);
    return res.status(200).json(reports.map(toPaymentReport));
  } catch (error) {
    if (
      error.message === "תאריך הסינון אינו תקין" ||
      error.message === "טווח התאריכים אינו תקין" ||
      error.message === "סטטוס התשלום אינו תקין" ||
      error.message === "סטטוס פרטי הבנק אינו תקין" ||
      error.message === "מזהה מנחה אינו תקין"
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Payment report list failed");
    return res.status(500).json({
      message: "לא ניתן לטעון את הדיווחים לתשלום",
    });
  }
};

function getExportFilename({ fromDate, toDate }) {
  if (fromDate && toDate && fromDate.slice(0, 7) === toDate.slice(0, 7)) {
    const [year, month] = fromDate.split("-").map(Number);
    return `Facilitator_Payments_${MONTH_NAMES[month - 1]}_${year}.xlsx`;
  }

  if (fromDate && toDate) {
    return `Facilitator_Payments_${fromDate}_to_${toDate}.xlsx`;
  }
  if (fromDate) return `Facilitator_Payments_From_${fromDate}.xlsx`;
  if (toDate) return `Facilitator_Payments_Through_${toDate}.xlsx`;

  return "Facilitator_Payments_All_Periods.xlsx";
}

async function getDecryptedBankDetails(facilitatorIds) {
  const facilitators = await User.find({
    _id: { $in: facilitatorIds },
    role: "facilitator",
  })
    .select("fullName email bankDetailsStatus +bankDetailsEncrypted")
    .lean();

  return new Map(
    facilitators.map((facilitator) => {
      if (
        facilitator.bankDetailsStatus === "provided" &&
        !facilitator.bankDetailsEncrypted
      ) {
        throw new Error("Stored bank details are unavailable");
      }

      const bankDetails = facilitator.bankDetailsEncrypted
        ? decryptBankDetails(facilitator.bankDetailsEncrypted)
        : {};
      return [String(facilitator._id), { facilitator, bankDetails }];
    })
  );
}

const exportPaymentWorkbook = async (req, res) => {
  try {
    const reports = (await loadApprovedReports(req.query)).map(toPaymentReport);
    const facilitatorIds = [
      ...new Set(reports.map((report) => String(report.facilitatorId?._id))),
    ].filter((id) => id !== "undefined");
    const bankDetailsByFacilitator =
      await getDecryptedBankDetails(facilitatorIds);

    const groupedReports = groupReportsByFacilitatorId(reports);

    const workbook = new ExcelJS.Workbook();
    const paymentsSheet = workbook.addWorksheet("Payments");
    paymentsSheet.columns = [
      { header: "Facilitator full name", key: "fullName", width: 28 },
      { header: "Facilitator email", key: "email", width: 32 },
      { header: "Account holder", key: "accountHolder", width: 26 },
      { header: "Bank name", key: "bankName", width: 20 },
      { header: "Bank number", key: "bankNumber", width: 16 },
      { header: "Branch number", key: "branchNumber", width: 16 },
      { header: "Account number", key: "accountNumber", width: 20 },
      { header: "Total approved amount", key: "totalAmount", width: 22 },
      { header: "Approved meetings", key: "meetingCount", width: 20 },
      { header: "Payment status", key: "paymentStatus", width: 18 },
    ];

    for (const [facilitatorId, facilitatorReports] of groupedReports) {
      const record = bankDetailsByFacilitator.get(facilitatorId);
      if (!record) throw new Error("Facilitator is unavailable");

      const statuses = new Set(
        facilitatorReports.map((report) => report.paymentStatus)
      );
      const paymentStatus =
        statuses.size > 1
          ? "Mixed"
          : statuses.has("paid")
            ? "Paid"
            : "Not paid";

      paymentsSheet.addRow({
        fullName: record.facilitator.fullName,
        email: record.facilitator.email,
        accountHolder: record.bankDetails.accountHolder || "",
        bankName: record.bankDetails.bankName || "",
        bankNumber: record.bankDetails.bankNumber || "",
        branchNumber: record.bankDetails.branchNumber || "",
        accountNumber: record.bankDetails.accountNumber || "",
        totalAmount: facilitatorReports.reduce(
          (sum, report) => sum + report.paymentAmount,
          0
        ),
        meetingCount: facilitatorReports.length,
        paymentStatus,
      });
    }

    const detailsSheet = workbook.addWorksheet("Payment Details");
    detailsSheet.columns = [
      { header: "Facilitator full name", key: "fullName", width: 28 },
      { header: "Facilitator email", key: "email", width: 32 },
      { header: "Meeting date", key: "meetingDate", width: 18 },
      { header: "Group / school", key: "groupSchool", width: 36 },
      { header: "Meeting topic", key: "topic", width: 36 },
      { header: "Approved payment amount", key: "amount", width: 24 },
      { header: "Approval date", key: "approvalDate", width: 18 },
    ];

    for (const report of reports) {
      const facilitatorId = String(report.facilitatorId?._id || "");
      const record = bankDetailsByFacilitator.get(facilitatorId);
      if (!record) throw new Error("Facilitator is unavailable");

      detailsSheet.addRow({
        fullName: record.facilitator.fullName,
        email: record.facilitator.email,
        meetingDate: report.meetingDate
          ? new Date(report.meetingDate)
          : null,
        groupSchool:
          report.schoolName ||
          report.groupId?.schoolName ||
          report.groupId?.name ||
          "",
        topic: report.topic,
        amount: report.paymentAmount,
        approvalDate: report.approvalDate
          ? new Date(report.approvalDate)
          : null,
      });
    }

    for (const sheet of [paymentsSheet, detailsSheet]) {
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ state: "frozen", ySplit: 1 }];
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${getExportFilename(req.query)}"`
    );

    const workbookBuffer = await workbook.xlsx.writeBuffer();
    return res.send(Buffer.from(workbookBuffer));
  } catch (error) {
    if (
      error.message === "תאריך הסינון אינו תקין" ||
      error.message === "טווח התאריכים אינו תקין" ||
      error.message === "סטטוס התשלום אינו תקין" ||
      error.message === "סטטוס פרטי הבנק אינו תקין" ||
      error.message === "מזהה מנחה אינו תקין"
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Payment workbook export failed");
    return res.status(500).json({
      message: "לא ניתן להפיק את קובץ התשלומים",
    });
  }
};

module.exports = {
  exportPaymentWorkbook,
  getPaymentFacilitators,
  getPaymentReports,
};
