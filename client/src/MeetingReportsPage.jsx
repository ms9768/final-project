
import { useEffect, useState } from "react";
import "./MeetingReports.css";
import "./components/ReportsPage.css";
import PageShell from "./components/ui/PageShell";
import { DashboardIcons } from "./components/ui/Decor";
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

function MeetingReportsPage({ initialShowForm = false, onBack, backLabel }) {
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
      icon: "reports",
      color: "purple",
    },
    {
      title: "דיווחים ממתינים לאישור",
      value: pendingReports.length,
      icon: "meetings",
      color: "yellow",
    },
    {
      title: "סכום לתשלום כולל שכירות",
      value: `${totalPayments.toLocaleString("he-IL")} ₪`,
      icon: "payments",
      color: "mint",
    },
  ];

  return (
    <PageShell
      className="mr"
      eyebrow={isCoordinatorView ? "מנחות ופגישות" : "האזור האישי"}
      title={isCoordinatorView ? "דיווחי פגישות" : "הדיווחים שלי"}
      subtitle="יחד מתכננים, משפיעים ומקדמים"
      onBack={onBack}
      backLabel={backLabel}
    >
      <section className="mr-stats">
        {stats.map((stat) => {
          const Icon = DashboardIcons[stat.icon];

          return (
            <div className={`mr-stat mr-stat-${stat.color}`} key={stat.title}>
              <span className="mr-stat-icon">{Icon && <Icon />}</span>
              <div>
                <strong>{loading ? "…" : stat.value}</strong>
                <span>{stat.title}</span>
              </div>
            </div>
          );
        })}
      </section>

      {message && (
        <p className="hp-alert hp-alert-success" role="status">
          <span aria-hidden="true">✓</span>
          {message}
        </p>
      )}

      {error && (
        <p className="hp-alert hp-alert-error" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}

      {!isCoordinatorView && showForm && (
        <ReportForm
          groups={groups}
          facilitatorLevel={currentUser?.facilitatorLevel}
          onSubmit={handleSaveReport}
          onCancel={handleCancelForm}
          initialData={editingReport}
        />
      )}

      <div className={`mr-layout ${isCoordinatorView ? "mr-layout-full" : ""}`}>
        <section className="mr-panel">
          <div className="mr-panel-heading">
            <h2>
              {isCoordinatorView ? "דיווחים לטיפול" : "הדיווחים שלי"}
            </h2>

            {!isCoordinatorView && !showForm && (
              <button
                type="button"
                className="hp-btn hp-btn-mint hp-btn-sm"
                onClick={handleNewReport}
              >
                ＋ דיווח על פגישה חדשה
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
          <aside className="mr-side">
            <PaymentSummary lecturerPayment={lecturerPayment} />
          </aside>
        )}
      </div>
    </PageShell>
  );
}

export default MeetingReportsPage;
