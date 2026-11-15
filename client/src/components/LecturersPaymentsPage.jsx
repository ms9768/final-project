
import { useEffect, useState } from "react";
import { getAllLecturersPayments } from "../services/meetingReportService";

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

  return (
    <main className="lecturers-payments-page" dir="rtl">
      <h1>תשלומים למנחות</h1>
      <p>סיכום התשלומים עבור הפגישות שאושרו</p>

      {loading ? (
        <p>טוענת נתוני תשלום...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <section className="total-payment-box">
            <span>סה"כ לתשלום לכל המנחות</span>
            <strong>
              {totalPayments.toLocaleString("he-IL")} ₪
            </strong>
          </section>

          {lecturersPayments.length === 0 ? (
            <p>לא נמצאו נתוני תשלום.</p>
          ) : (
            <section className="lecturers-payments-list">
              {lecturersPayments.map((payment) => (
                <article
                  className="lecturer-payment-row"
                  key={payment.lecturerId}
                >
                  <h2>
                    {payment.lecturerName || payment.email}
                  </h2>

                  <p>
                    <strong>סוג מנחה:</strong>{" "}
                    {payment.facilitatorLevel === "young"
                      ? "מנחה צעירה"
                      : payment.facilitatorLevel === "senior"
                      ? "מנחה בוגרת"
                      : "לא הוגדר"}
                  </p>

                  <p>
                    <strong>תעריף לפגישה:</strong>{" "}
                    {payment.paymentPerMeeting !== null
                      ? `${payment.paymentPerMeeting} ₪`
                      : "לא הוגדר"}
                  </p>

                  <p>
                    <strong>מספר פגישות שאושרו:</strong>{" "}
                    {payment.approvedMeetingsCount}
                  </p>

                  <p>
                    <strong>סה"כ לתשלום:</strong>{" "}
                    {payment.totalPayment !== null
                      ? `${payment.totalPayment.toLocaleString("he-IL")} ₪`
                      : "לא ניתן לחשב"}
                  </p>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default LecturersPaymentsPage;
