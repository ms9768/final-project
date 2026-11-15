import { useEffect, useState } from "react";
import "../PaymentManagement.css";
import "./AdminPages.css";
import "./PaymentManager.css";
import PageShell from "./ui/PageShell";
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

  const unpaidCount = reports.filter((report) => report.paymentStatus !== "paid").length;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <PageShell
      className="pm"
      eyebrow="ניהול תשלומים"
      title="תשלומי מנחות"
      subtitle="דיווחים שאושרו על ידי רכזת בלבד"
    >
      <div className="adm">
        <section className="adm-summary pm-summary">
          <div className="adm-summary-main">
            <span>סכום הדיווחים המוצגים</span>
            <strong>{formatAmount(totalAmount)}</strong>
          </div>

          <div className="adm-summary-item">
            <strong>{reports.length}</strong>
            <span>דיווחים בתקופה שנבחרה</span>
          </div>

          <div className="adm-summary-item">
            <strong>{unpaidCount}</strong>
            <span>ממתינים לתשלום</span>
          </div>
        </section>

        <section className="adm-card pm-filters" aria-label="סינון תשלומים">
          <div className="pm-filters-head">
            <h2 className="adm-card-title">סינון</h2>

            <div className="pm-filters-actions">
              {hasFilters && (
                <button
                  type="button"
                  className="pm-clear"
                  onClick={() => {
                    setLoading(true);
                    setReports([]);
                    setFilters(EMPTY_FILTERS);
                  }}
                >
                  ניקוי סינון
                </button>
              )}

              <button
                type="button"
                className="hp-btn hp-btn-mint hp-btn-sm"
                onClick={handleExport}
                disabled={exporting}
              >
                <svg className="pm-excel" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                  <path d="M14 3v5h5M9 12l4 5M13 12l-4 5" />
                </svg>
                {exporting ? "מכינה קובץ..." : "ייצוא Excel"}
              </button>
            </div>
          </div>

          <div className="pm-filters-grid">
            <label className="adm-field pm-field-wide">
              <span>מנחה</span>
              <select name="facilitatorId" value={filters.facilitatorId} onChange={updateFilter}>
                <option value="">כל המנחות</option>
                {facilitators.map((facilitator) => (
                  <option key={facilitator._id} value={facilitator._id}>
                    {facilitator.fullName} — {facilitator.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="adm-field">
              <span>מתאריך</span>
              <input name="fromDate" type="date" value={filters.fromDate} onChange={updateFilter} />
            </label>

            <label className="adm-field">
              <span>עד תאריך</span>
              <input name="toDate" type="date" value={filters.toDate} onChange={updateFilter} />
            </label>

            <label className="adm-field">
              <span>מצב תשלום</span>
              <select name="paymentStatus" value={filters.paymentStatus} onChange={updateFilter}>
                <option value="">כל המצבים</option>
                <option value="not_started">טרם שולם</option>
                <option value="paid">שולם</option>
              </select>
            </label>

            <label className="adm-field">
              <span>פרטי חשבון בנק</span>
              <select name="bankDetailsStatus" value={filters.bankDetailsStatus} onChange={updateFilter}>
                <option value="">כל המצבים</option>
                <option value="provided">התקבלו</option>
                <option value="not_submitted">טרם נמסרו</option>
              </select>
            </label>
          </div>
        </section>

        {error && (
          <p className="hp-alert hp-alert-error" role="alert">
            <span aria-hidden="true">!</span>
            {error}
          </p>
        )}
        {message && (
          <p className="hp-alert hp-alert-success" role="status">
            <span aria-hidden="true">✓</span>
            {message}
          </p>
        )}

        <section className="adm-card pm-table-card">
          {loading ? (
            <p className="adm-state">טוענת דיווחים מאושרים...</p>
          ) : reports.length === 0 ? (
            <p className="adm-state">לא נמצאו דיווחים מאושרים בסינון שנבחר.</p>
          ) : (
            <div className="pm-table-wrapper">
              <table className="pm-table">
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
                  {reports.map((report) => {
                    const facilitator = report.facilitatorId || {};
                    const groupName =
                      report.schoolName ||
                      report.groupId?.schoolName ||
                      report.groupId?.name ||
                      "—";
                    const isPaid = report.paymentStatus === "paid";
                    const hasBank = report.bankDetailsStatus === "provided";

                    return (
                      <tr key={report._id} className={isPaid ? "is-paid" : ""}>
                        <td data-label="מנחה">
                          <div className="pm-person">
                            <strong>{facilitator.fullName || "—"}</strong>
                            <small>{facilitator.email || "—"}</small>
                          </div>
                        </td>
                        <td data-label="תאריך">
                          {report.meetingDate
                            ? new Date(report.meetingDate).toLocaleDateString("he-IL")
                            : "—"}
                        </td>
                        <td data-label="קבוצה">{groupName}</td>
                        <td data-label="סכום" className="pm-amount">{formatAmount(report.paymentAmount)}</td>
                        <td data-label="פרטי חשבון">
                          <span className={`adm-tag ${hasBank ? "bd-tag-ok" : "bd-tag-missing"}`}>
                            {hasBank ? "התקבלו" : "טרם נמסרו"}
                          </span>
                        </td>
                        <td data-label="מצב תשלום">
                          <span className={`adm-tag ${isPaid ? "bd-tag-ok" : "pm-tag-unpaid"}`}>
                            {formatStatus(report.paymentStatus)}
                          </span>
                        </td>
                        <td className="pm-action-cell">
                          {isPaid ? (
                            <span className="pm-paid">✓ שולם</span>
                          ) : (
                            <button
                              type="button"
                              className="pm-mark"
                              onClick={() => handleMarkPaid(report._id)}
                              disabled={updatingReportId === report._id}
                            >
                              {updatingReportId === report._id ? "מעדכנת..." : "סימון כשולם"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="pm-note">
          סימון כתשלום מתעד את סטטוס התשלום בלבד. המערכת אינה מבצעת העברה בנקאית.
        </p>
      </div>
    </PageShell>
  );
}

export default PaymentManagementPage;
