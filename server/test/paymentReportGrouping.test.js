const test = require("node:test");
const assert = require("node:assert/strict");

const {
  groupReportsByFacilitatorId,
} = require("../services/paymentReportGrouping");

test("payment summaries keep facilitators with identical names and emails separate", () => {
  const reports = [
    {
      _id: "report-1",
      facilitatorId: {
        _id: "facilitator-1",
        fullName: "Same Name",
        email: "same@example.com",
      },
    },
    {
      _id: "report-2",
      facilitatorId: {
        _id: "facilitator-2",
        fullName: "Same Name",
        email: "same@example.com",
      },
    },
  ];

  const groupedReports = groupReportsByFacilitatorId(reports);

  assert.equal(groupedReports.size, 2);
  assert.equal(groupedReports.get("facilitator-1")[0]._id, "report-1");
  assert.equal(groupedReports.get("facilitator-2")[0]._id, "report-2");
});
