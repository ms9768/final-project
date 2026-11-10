
import { useState } from "react";
import CoordinatorActions from "./CoordinatorActions";

function ReportList({
  reports,
  loading,
  error,
  onEdit,
  isCoordinatorView,
  onUpdateStatus,
}) {
  const [historyReport, setHistoryReport] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const statusLabels = {
    pending: "ממתין לאישור",
    approved: "אושר",
    rejected: "נדחה",
    needs_correction: "נדרש תיקון",
  };

  async function showHistory(reportId) {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        `http://localhost:5600/api/meeting-reports/${reportId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "שגיאה בטעינת ההיסטוריה");
      }

      setHistoryReport(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  if (loading) {
    return <p className="table-message">טוען דיווחים...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const validReports = Array.isArray(reports)
    ? reports.filter((report) => report && report._id)
    : [];

  if (validReports.length === 0) {
    return (
      <p className="table-message">
        עדיין אין דיווחים להצגה.
      </p>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>נושא הפגישה</th>
              <th>קבוצה</th>
              <th>תאריך</th>
              <th>משתתפים</th>
              <th>סטטוס</th>
              <th>קבלה</th>

              {!isCoordinatorView && <th>הערות רכזת</th>}

              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {validReports.map((report) => {
              const canEdit =
                report.status === "pending" ||
                report.status === "needs_correction";

              const groupName = report.groupId?.name || "—";
              const hasReceipt = Boolean(report.receipt?.fileName);

              const receiptUrl =
                `http://localhost:5600/api/meeting-reports/${report._id}/receipt`;

              return (
                <tr key={report._id}>
                  <td className="topic-cell">{report.topic}</td>

                  <td>{groupName}</td>

                  <td>
                    {new Date(report.meetingDate).toLocaleDateString("he-IL")}
                  </td>

                  <td>{report.participantCount}</td>

                  <td>
                    <span className={`status-badge ${report.status}`}>
                      {statusLabels[report.status] || report.status}
                    </span>
                  </td>

                  <td>
                    {hasReceipt ? (
                      <a
                        className="receipt-link"
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        צפייה בקבלה
                      </a>
                    ) : (
                      <span className="no-receipt">
                        לא הועלתה קבלה
                      </span>
                    )}
                  </td>

                  {!isCoordinatorView && (
                    <td className="coordinator-notes-cell">
                      {report.coordinatorNotes || (
                        <span className="no-action">—</span>
                      )}
                    </td>
                  )}

                  <td className="actions-cell">
                    <button
                      type="button"
                      className="table-action-button"
                      onClick={() => showHistory(report._id)}
                    >
                      היסטוריה
                    </button>

                    {isCoordinatorView ? (
                      report.status === "pending" && (
                        <CoordinatorActions
                          report={report}
                          onUpdateStatus={onUpdateStatus}
                        />
                      )
                    ) : (
                      canEdit && (
                        <button
                          className="table-action-button"
                          type="button"
                          onClick={() => onEdit(report)}
                        >
                          עריכה
                        </button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {historyLoading && (
        <p className="table-message">טוען היסטוריה...</p>
      )}

      {historyReport && (
        <div className="history-overlay">
          <div className="history-modal">
            <div className="history-header">
              <h2>היסטוריית דיווח</h2>

              <button
                type="button"
                onClick={() => setHistoryReport(null)}
              >
                ✕
              </button>
            </div>

            <p>
              <strong>נושא הפגישה:</strong>{" "}
              {historyReport.topic}
            </p>

            {historyReport.statusHistory?.length ? (
              [...historyReport.statusHistory]
                .reverse()
                .map((item, index) => (
                  <div className="history-item" key={index}>
                    <strong>
                      {statusLabels[item.status] || item.status}
                    </strong>

                    <p>
                      {new Date(item.changedAt).toLocaleString("he-IL")}
                    </p>

                    {item.changedBy && (
                      <p>
                        בוצע על ידי:{" "}
                        {item.changedBy.fullName || item.changedBy.email}
                      </p>
                    )}

                    {item.coordinatorNotes && (
                      <p>{item.coordinatorNotes}</p>
                    )}
                  </div>
                ))
            ) : (
              <p>אין עדיין היסטוריה להצגה.</p>
            )}

            <button
              type="button"
              className="history-close-button"
              onClick={() => setHistoryReport(null)}
            >
              סגירה
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportList;
