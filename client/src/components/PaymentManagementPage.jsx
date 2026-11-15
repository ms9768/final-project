import { useEffect, useState } from "react";
import "../PaymentManagement.css";
import {
  exportPaymentWorkbook,
  getPaymentFacilitators,
  getPaymentReports,
  markPaymentReportPaid,
} from "../services/paymentManagementService";

const EMPTY_FILTERS = {
  fromDate: "",
  toDate: "",
  facilitatorId: "",
  paymentStatus: "",
  bankDetailsStatus: "",
};

function formatAmount(amount) {
  return `${Number(amount || 0).toLocaleString("he-IL")} ₪`;
}

function formatStatus(status) {
  return status === "paid" ? "שולם" : "טרם שולם";
}

function PaymentManagementPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [facilitators, setFacilitators] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getPaymentReports(filters)
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "שגיאה בטעינת הדיווחים לתשלום");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function loadFacilitators() {
      try {
        const data = await getPaymentFacilitators();
        if (!cancelled) setFacilitators(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "שגיאה בטעינת רשימת המנחות");
        }
      }
    }

    loadFacilitators();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateFilter(event) {
    const { name, value } = event.target;
    setLoading(true);
    setError("");
    setReports([]);
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleMarkPaid(reportId) {
    if (!window.confirm("לסמן את הדיווח המאושר כשולם?")) return;

    try {
      setUpdatingReportId(reportId);
      setError("");
      setMessage("");
      const result = await markPaymentReportPaid(reportId);
      setMessage(result.message || "הדיווח סומן כשולם");
      setReports(await getPaymentReports(filters));
    } catch (requestError) {
      setError(requestError.message || "לא ניתן לסמן את הדיווח כשולם");
    } finally {
      setUpdatingReportId("");
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      setError("");
      await exportPaymentWorkbook(filters);
    } catch (requestError) {
      setError(requestError.message || "לא ניתן להפיק את קובץ התשלומים");
    } finally {
      setExporting(false);
    }
  }

  const totalAmount = reports.reduce(
    (sum, report) => sum + Number(report.paymentAmount || 0),
    0
  );

  return (
    <main className="payment-management-page" dir="rtl">
      <header className="payment-management-header">
        <div>
          <p className="eyebrow">ניהול תשלומים</p>
          <h1>תשלומי מנחות</h1>
          <p>דיווחים שאושרו על ידי רכזת בלבד</p>
        </div>
        <button
          type="button"
          className="payment-export-button"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "מכינה קובץ..." : "ייצוא Excel"}
        </button>
      </header>

      <section className="payment-management-summary">
        <div>
          <span>דיווחים בתקופה שנבחרה</span>
          <strong>{reports.length}</strong>
        </div>
        <div>
          <span>סכום הדיווחים המוצגים</span>
          <strong>{formatAmount(totalAmount)}</strong>
        </div>
      </section>

      <section className="payment-management-filters" aria-label="סינון תשלומים">
        <label>
          מנחה
          <select
            name="facilitatorId"
            value={filters.facilitatorId}
            onChange={updateFilter}
          >
            <option value="">כל המנחות</option>
            {facilitators.map((facilitator) => (
              <option key={facilitator._id} value={facilitator._id}>
                {facilitator.fullName} — {facilitator.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          מתאריך
          <input
            name="fromDate"
            type="date"
            value={filters.fromDate}
            onChange={updateFilter}
          />
        </label>

        <label>
          עד תאריך
          <input
            name="toDate"
            type="date"
            value={filters.toDate}
            onChange={updateFilter}
          />
        </label>

        <label>
          מצב תשלום
          <select
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={updateFilter}
          >
            <option value="">כל המצבים</option>
            <option value="not_started">טרם שולם</option>
            <option value="paid">שולם</option>
          </select>
        </label>

        <label>
          פרטי חשבון בנק
          <select
            name="bankDetailsStatus"
            value={filters.bankDetailsStatus}
            onChange={updateFilter}
          >
            <option value="">כל המצבים</option>
            <option value="provided">התקבלו</option>
            <option value="not_submitted">טרם נמסרו</option>
          </select>
        </label>
      </section>

      {error && (
        <p className="payment-management-message error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="payment-management-message" role="status">
          {message}
        </p>
      )}

      <div className="payment-management-table-wrapper">
        <table className="payment-management-table">
          <thead>
            <tr>
              <th>מנחה</th>
              <th>תאריך פגישה</th>
              <th>קבוצה / בית ספר</th>
              <th>סכום מאושר</th>
              <th>פרטי חשבון</th>
              <th>מצב תשלום</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">טוענת דיווחים מאושרים...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="7">לא נמצאו דיווחים מאושרים בסינון שנבחר.</td>
              </tr>
            ) : (
              reports.map((report) => {
                const facilitator = report.facilitatorId || {};
                const groupName =
                  report.schoolName ||
                  report.groupId?.schoolName ||
                  report.groupId?.name ||
                  "—";

                return (
                  <tr key={report._id}>
                    <td>
                      <strong>{facilitator.fullName || "—"}</strong>
                      <small>{facilitator.email || "—"}</small>
                    </td>
                    <td>
                      {report.meetingDate
                        ? new Date(report.meetingDate).toLocaleDateString("he-IL")
                        : "—"}
                    </td>
                    <td>{groupName}</td>
                    <td>{formatAmount(report.paymentAmount)}</td>
                    <td>
                      <span
                        className={`payment-status-pill ${
                          report.bankDetailsStatus === "provided"
                            ? "complete"
                            : "missing"
                        }`}
                      >
                        {report.bankDetailsStatus === "provided"
                          ? "התקבלו"
                          : "טרם נמסרו"}
                      </span>
                    </td>
                    <td>{formatStatus(report.paymentStatus)}</td>
                    <td>
                      {report.paymentStatus === "paid" ? (
                        <span className="payment-paid-label">שולם</span>
                      ) : (
                        <button
                          type="button"
                          className="payment-mark-paid-button"
                          onClick={() => handleMarkPaid(report._id)}
                          disabled={updatingReportId === report._id}
                        >
                          {updatingReportId === report._id
                            ? "מעדכנת..."
                            : "סימון כשולם"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="payment-management-note">
        סימון כתשלום מתעד את סטטוס התשלום בלבד. המערכת אינה מבצעת העברה בנקאית.
      </p>
    </main>
  );
}

export default PaymentManagementPage;
