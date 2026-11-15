
import { useState } from "react";
import { API_BASE_URL } from "../services/apiConfig";
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

      const token = sessionStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}/api/meeting-reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  // הצגת קבלה עם אסימון ההתחברות
  async function viewReceipt(reportId) {
    const receiptWindow = window.open("about:blank", "_blank");

    if (!receiptWindow) {
      alert("הדפדפן חסם את פתיחת הקבלה. יש לאפשר חלונות קופצים.");
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}/api/meeting-reports/${reportId}/receipt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = "שגיאה בטעינת הקבלה";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // אין תשובת JSON
        }

        throw new Error(message);
      }

      const fileBlob = await response.blob();
      const fileUrl = URL.createObjectURL(fileBlob);

      receiptWindow.location.href = fileUrl;

      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      receiptWindow.close();
      alert(err.message);
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
              {isCoordinatorView && <th>שם המנחה</th>}

              <th>נושא הפגישה</th>
              <th>קבוצה</th>
              <th>תאריך</th>
              <th>משתתפים</th>
              <th>סטטוס</th>
              <th>קבלה</th>

              {isCoordinatorView && (
                <>
                  <th>סכום לתשלום</th>
                  <th>מצב תשלום</th>
                </>
              )}

              {!isCoordinatorView && (
                <>
                  <th>הערות רכזת</th>
                  <th>מצב תשלום</th>
                </>
              )}

              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {validReports.map((report) => {
              const canEdit =
                report.status === "pending" ||
                report.status === "needs_correction";

              const groupName = report.groupId?.name || "—";

              const facilitatorName =
                report.facilitatorId?.fullName || "—";
              const facilitatorEmail =
                report.facilitatorId?.email || "—";

              const hasReceipt = Boolean(report.receipt?.fileName);
              const isApproved = report.status === "approved";
              const isPaid = report.paymentStatus === "paid";

              return (
                <tr key={report._id}>
                  {isCoordinatorView && (
                    <td data-label="שם המנחה">
                      <div>{facilitatorName}</div>
                      <small className="facilitator-email">
                        {facilitatorEmail}
                      </small>
                    </td>
                  )}

                  <td className="topic-cell" data-label="נושא">{report.topic}</td>

                  <td data-label="קבוצה">{groupName}</td>

                  <td data-label="תאריך">
                    {new Date(report.meetingDate).toLocaleDateString("he-IL")}
                  </td>

                  <td data-label="משתתפים">{report.participantCount}</td>

                  <td data-label="סטטוס">
                    <span className={`status-badge ${report.status}`}>
                      {statusLabels[report.status] || report.status}
                    </span>
                  </td>

                  <td data-label="קבלה">
                    {hasReceipt ? (
                      <button
                        type="button"
                        className="table-action-button"
                        onClick={() => viewReceipt(report._id)}
                      >
                        צפייה בקבלה
                      </button>
                    ) : (
                      <span className="no-receipt">
                        לא הועלתה קבלה
                      </span>
                    )}
                  </td>

                  {isCoordinatorView && (
                    <>
                      <td data-label="סכום לתשלום">
                        {isApproved
                          ? `${Number(report.paymentAmount || 0).toLocaleString("he-IL")} ₪`
                          : "יחושב לאחר אישור"}
                      </td>

                      <td data-label="מצב תשלום">
                        {!isApproved ? (
                          <span className="no-action">—</span>
                        ) : (
                          <span
                            className={`status-badge ${
                              isPaid ? "approved" : "pending"
                            }`}
                          >
                            {isPaid ? "שולם" : "לא שולם"}
                          </span>
                        )}
                      </td>
                    </>
                  )}

                  {!isCoordinatorView && (
                    <>
                      <td className="coordinator-notes-cell" data-label="הערות רכזת">
                        {report.coordinatorNotes || (
                          <span className="no-action">—</span>
                        )}
                      </td>
                      <td className="payment-status-cell" data-label="מצב תשלום">
                        <span
                          className={`status-badge ${
                            isPaid ? "approved" : "pending"
                          }`}
                        >
                          {isPaid ? "שולם" : "ממתין לתשלום"}
                        </span>
                      </td>
                    </>
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
                className="history-x"
                aria-label="סגירה"
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
