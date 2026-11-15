const MeetingReport = require("../models/MeetingReport");

async function markApprovedReportPaid({ reportId, paymentManagerId }) {
  return MeetingReport.findOneAndUpdate(
    {
      _id: reportId,
      status: "approved",
      paymentStatus: "not_started",
    },
    {
      $set: {
        paymentStatus: "paid",
        paymentDate: new Date(),
        paidBy: paymentManagerId,
      },
    },
    { new: true, runValidators: true }
  );
}

module.exports = { markApprovedReportPaid };
