function groupReportsByFacilitatorId(reports) {
  const groupedReports = new Map();

  for (const report of reports) {
    const facilitatorId = report.facilitatorId?._id;
    if (!facilitatorId) continue;

    const key = String(facilitatorId);
    const facilitatorReports = groupedReports.get(key) || [];
    facilitatorReports.push(report);
    groupedReports.set(key, facilitatorReports);
  }

  return groupedReports;
}

module.exports = { groupReportsByFacilitatorId };
