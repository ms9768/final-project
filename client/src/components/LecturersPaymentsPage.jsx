
import { useEffect, useState } from "react";
import { getAllLecturersPayments } from "../services/meetingReportService";
import "./AdminPages.css";

function LecturersPaymentsPage() {
  const [lecturersPayments, setLecturersPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllLecturersPayments();

      setLecturersPayments(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(err.message || "שגיאה בטעינת התשלומים");
    } finally {
      setLoading(false);
    }
  }

  const totalPayments = lecturersPayments.reduce(
    (sum, payment) => sum + (payment.totalPayment || 0),
    0
  );

  const levelLabels = {
    young: "מנחה צעירה",
    senior: "מנחה בוגרת",
  };

  const totalMeetings = lecturersPayments.reduce(
    (sum, payment) => sum + (payment.approvedMeetingsCount || 0),
    0
  );

  return (
    <div className="adm lpay">
      {loading ? (
        <p className="adm-state">טוענת נתוני תשלום...</p>
      ) : error ? (
        <p className="hp-alert hp-alert-error" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      ) : (
        <>
          <section className="adm-summary">
            <div className="adm-summary-main">
              <span>סה"כ לתשלום לכל המנחות</span>
              <strong>{totalPayments.toLocaleString("he-IL")} ₪</strong>
            </div>

            <div className="adm-summary-item">
              <strong>{lecturersPayments.length}</strong>
              <span>מנחות</span>
            </div>

            <div className="adm-summary-item">
              <strong>{totalMeetings}</strong>
              <span>פגישות שאושרו</span>
            </div>
          </section>

          {lecturersPayments.length === 0 ? (
            <p className="adm-state">לא נמצאו נתוני תשלום.</p>
          ) : (
            <section className="adm-card">
              <h2 className="adm-card-title">פירוט לפי מנחה</h2>

              <div className="lpay-list">
                {lecturersPayments.map((payment) => {
                  const name = payment.lecturerName || payment.email || "";

                  return (
                    <article className="lpay-row" key={payment.lecturerId}>
                      <div className="lpay-person">
                        <span className="adm-avatar" aria-hidden="true">
                          {name.trim()[0] || "?"}
                        </span>
                        <div>
                          <h3>{name}</h3>
                          <span className={`adm-tag adm-tag-${payment.facilitatorLevel || "none"}`}>
                            {levelLabels[payment.facilitatorLevel] || "לא הוגדר"}
                          </span>
                        </div>
                      </div>

                      <dl className="lpay-numbers">
                        <div>
                          <dt>תעריף לפגישה</dt>
                          <dd>
                            {payment.paymentPerMeeting !== null
                              ? `${Number(payment.paymentPerMeeting).toLocaleString("he-IL")} ₪`
                              : "לא הוגדר"}
                          </dd>
                        </div>

                        <div>
                          <dt>פגישות שאושרו</dt>
                          <dd>{payment.approvedMeetingsCount}</dd>
                        </div>

                        <div className="lpay-total">
                          <dt>סה"כ לתשלום</dt>
                          <dd>
                            {payment.totalPayment !== null
                              ? `${payment.totalPayment.toLocaleString("he-IL")} ₪`
                              : "לא ניתן לחשב"}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default LecturersPaymentsPage;
