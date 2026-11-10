
function ReportCard({ report, onEdit }) {
  const statusLabels = {
    pending: "ממתין לאישור",
    approved: "אושר",
    rejected: "נדחה",
    needs_correction: "נדרש תיקון",
  };

  const canEdit =
    report.status === "pending" ||
    report.status === "needs_correction";

  return (
    <div className="report-card">
      <h3>{report.topic}</h3>

      <p>
        <strong>תאריך:</strong>{" "}
        {new Date(report.meetingDate).toLocaleDateString("he-IL")}
      </p>

      <p>
        <strong>מספר משתתפים:</strong> {report.participantCount}
      </p>

      <p>
        <strong>עלות כיבוד:</strong> {report.refreshmentsCost} ₪
      </p>

      <p>
        <strong>סטטוס:</strong>{" "}
        {statusLabels[report.status] || report.status}
      </p>

      {report.isRefreshmentsOverBudget && (
        <p className="budget-warning">
          שים לב: התקציב לכיבוד חרג!
        </p>
      )}

      {report.coordinatorNotes && (
        <p>
          <strong>הערות רכזת:</strong> {report.coordinatorNotes}
        </p>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={() => onEdit(report)}
        >
          עריכת דיווח
        </button>
      )}
    </div>
  );
}

export default ReportCard;
