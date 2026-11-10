
import { useEffect, useState } from "react";
import "./MeetingReports.css";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import PaymentSummary from "./components/PaymentSummary";
import SystemSettings from "./components/SystemSettings";

import {
  getReports,
  getGroups,
  createReport,
  updateReport,
  updateReportStatus,
  uploadReceipt,
  getLecturerPayment,
  getAllLecturersPayments,
} from "./services/meetingReportService";

const LECTURER_ID = "6aebb3f20e1e4f0c9ecd38cd";

function MeetingReportsPage() {
  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lecturerPayment, setLecturerPayment] = useState(null);
  const [lecturersPayments, setLecturersPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isCoordinatorView, setIsCoordinatorView] = useState(false);
  const [message, setMessage] = useState("");
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        reportsData,
        groupsData,
        paymentData,
        allPaymentsData,
      ] = await Promise.all([
        getReports(),
        getGroups(LECTURER_ID),
        getLecturerPayment(LECTURER_ID),
        getAllLecturersPayments(),
      ]);

      setReports(
        Array.isArray(reportsData)
          ? reportsData.filter(Boolean)
          : []
      );

      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setLecturerPayment(paymentData);
      setLecturersPayments(
        Array.isArray(allPaymentsData) ? allPaymentsData : []
      );
    } catch (err) {
      setError(err.message || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  }

  function handleNewReport() {
    setEditingReport(null);
    setShowForm(true);
    setMessage("");
  }

  function handleEditReport(report) {
    setEditingReport(report);
    setShowForm(true);
    setMessage("");
  }

  function handleCancelForm() {
    setEditingReport(null);
    setShowForm(false);
  }

  async function handleSaveReport(reportData, receipt) {
    try {
      setMessage(
        editingReport ? "מעדכן את הדיווח..." : "שומר את הדיווח..."
      );

      let reportId;

      if (editingReport) {
        const result = await updateReport(
          editingReport._id,
          reportData
        );

        reportId = result.report._id;
      } else {
        const result = await createReport(reportData);
        reportId = result.report._id;
      }

      if (receipt) {
        setMessage("הדיווח נשמר. מעלה את הקבלה...");
        await uploadReceipt(reportId, receipt);
      }

      await loadData();

      setEditingReport(null);
      setShowForm(false);

      setMessage(
        editingReport
          ? "השינויים בדיווח נשמרו בהצלחה!"
          : "הדיווח נשמר בהצלחה!"
      );
    } catch (err) {
      setMessage(err.message || "אירעה שגיאה בשמירת הדיווח");
    }
  }

  async function handleUpdateStatus(
    reportId,
    status,
    coordinatorNotes = ""
  ) {
    try {
      await updateReportStatus(
        reportId,
        status,
        coordinatorNotes
      );

      const reportsData = await getReports();

      setReports(
        Array.isArray(reportsData)
          ? reportsData.filter(Boolean)
          : []
      );

      const [paymentData, allPaymentsData] =
        await Promise.all([
          getLecturerPayment(LECTURER_ID),
          getAllLecturersPayments(),
        ]);

      setLecturerPayment(paymentData);
      setLecturersPayments(allPaymentsData);

      setMessage("הדיווח עודכן בהצלחה!");
    } catch (err) {
      setMessage(err.message || "שגיאה בעדכון הדיווח");
    }
  }

  function handleViewChange() {
    setIsCoordinatorView((previous) => !previous);
    handleCancelForm();
    setMessage("");
  }

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  );

  const totalPayments = isCoordinatorView
    ? lecturersPayments.reduce(
      (sum, payment) => sum + (payment.totalPayment || 0),
      0
    )
    : lecturerPayment?.totalPayment || 0;

  const stats = [
    {
      title: 'סה"כ דיווחים',
      value: reports.length,
      icon: "▤",
      color: "blue",
    },
    {
      title: "דיווחים ממתינים לאישור",
      value: pendingReports.length,
      icon: "◷",
      color: "gold",
    },
    {
      title: "סכום לתשלום",
      value: `${totalPayments.toLocaleString("he-IL")} ₪`,
      icon: "₪",
      color: "green",
    },
  ];

  return (
    <main className="meeting-reports-page">
      <header className="page-header">
        <div className="brand">
          <div className="brand-symbol">✧</div>
          <div>
            <h1>מערכת דיווחי פגישות</h1>
            <p>יחד מתכננים, משפיעים ומקדמים</p>
          </div>
        </div>

        <button className="view-toggle" onClick={handleViewChange}>
          {isCoordinatorView
            ? "תצוגת מנחה"
            : "תצוגת רכזת"}
        </button>
      </header>

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <section className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className={`stat-icon ${stat.color}`}>
              {stat.icon}
            </div>

            <div className="stat-divider" />

            <div className="stat-content">
              <strong>{stat.value}</strong>
              <span>{stat.title}</span>
            </div>
          </div>
        ))}
      </section>

      {!isCoordinatorView && showForm && (
        <ReportForm
          groups={groups}
          onSubmit={handleSaveReport}
          onCancel={handleCancelForm}
          initialData={editingReport}
        />
      )}

      <div className="dashboard-grid">
        <section className="reports-panel">
          <div className="panel-heading">
            <div>
              <span className="heading-icon">▦</span>
              <h2>
                {isCoordinatorView
                  ? "דיווחים לטיפול"
                  : "הדיווחים שלי"}
              </h2>
            </div>

            {!isCoordinatorView && !showForm && (
              <button
                className="new-report-button"
                onClick={handleNewReport}
              >
                <span>＋</span>
                דיווח על פגישה חדשה
              </button>
            )}
          </div>

          <ReportList
            reports={reports}
            loading={loading}
            error={error}
            onEdit={handleEditReport}
            isCoordinatorView={isCoordinatorView}
            onUpdateStatus={handleUpdateStatus}
          />
        </section>

        <aside className="side-panel">
          {!isCoordinatorView ? (
            <PaymentSummary lecturerPayment={lecturerPayment} />
          ) : (
            <>
              <section className="payments-panel">
                <h2>סיכום תשלומים</h2>

                {lecturersPayments.length === 0 ? (
                  <p>לא נמצאו נתוני תשלום.</p>
                ) : (
                  <>
                    <div className="total-payment-box">
                      <span>סה"כ לתשלום</span>
                      <strong>
                        {totalPayments.toLocaleString("he-IL")} ₪
                      </strong>
                    </div>

                    {lecturersPayments.map((payment) => (
                      <div
                        className="lecturer-payment-row"
                        key={payment.lecturerId}
                      >
                        <strong>
                          {payment.lecturerName || payment.email}
                        </strong>

                        <span>
                          {payment.totalPayment.toLocaleString("he-IL")} ₪
                        </span>

                        <small>
                          {payment.approvedMeetingsCount} פגישות שאושרו
                        </small>
                      </div>
                    ))}
                  </>
                )}
              </section>

              <SystemSettings />
            </>
          )}
        </aside>
      </div>

      <footer className="welcome-banner">
        <span className="welcome-symbol">♡</span>

        <div>
          <strong>ברוכים הבאים למערכת!</strong>
          <p>
            כאן תוכלו לדווח על פגישות, לעקוב אחר סטטוס הדיווחים
            ולצפות בסיכום התשלומים.
          </p>
        </div>

        <span className="welcome-decoration">✧</span>
      </footer>
    </main>
  );
}

export default MeetingReportsPage;
