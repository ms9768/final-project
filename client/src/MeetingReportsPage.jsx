
import { useEffect, useState } from "react";
import "./MeetingReports.css";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import PaymentSummary from "./components/PaymentSummary";

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

function MeetingReportsPage({ initialShowForm = false }) {
  const currentUser = JSON.parse(
    sessionStorage.getItem("currentUser") || "null"
  );

  const isCoordinatorView = currentUser?.role === "coordinator";

  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lecturerPayment, setLecturerPayment] = useState(null);
  const [lecturersPayments, setLecturersPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(initialShowForm);
  const [message, setMessage] = useState("");
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      if (!currentUser?.id || !currentUser?.role) {
        throw new Error("פרטי המשתמשת המחוברת לא נמצאו");
      }

      const reportsData = await getReports();

      setReports(
        Array.isArray(reportsData)
          ? reportsData.filter(Boolean)
          : []
      );

      if (isCoordinatorView) {
        const allPaymentsData = await getAllLecturersPayments();

        setLecturersPayments(
          Array.isArray(allPaymentsData) ? allPaymentsData : []
        );

        setGroups([]);
        setLecturerPayment(null);
      } else {
        const [groupsData, paymentData] = await Promise.all([
          getGroups(currentUser.id),
          getLecturerPayment(currentUser.id),
        ]);

        setGroups(Array.isArray(groupsData) ? groupsData : []);
        setLecturerPayment(paymentData);
        setLecturersPayments([]);
      }
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

      await loadData();

      setMessage("הדיווח עודכן בהצלחה!");
    } catch (err) {
      setMessage(err.message || "שגיאה בעדכון הדיווח");
    }
  }

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  );

  const totalPayments = isCoordinatorView
    ? lecturersPayments.reduce(
        (sum, payment) =>
          sum + (payment.totalCombinedPayment ?? payment.totalPayment ?? 0),
        0
      )
    : lecturerPayment?.totalCombinedPayment ??
      lecturerPayment?.totalPayment ??
      0;

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
      title: "סכום לתשלום כולל שכירות",
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
          facilitatorLevel={currentUser?.facilitatorLevel}
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

        {!isCoordinatorView && (
          <aside className="side-panel">
            <PaymentSummary lecturerPayment={lecturerPayment} />
          </aside>
        )}
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
