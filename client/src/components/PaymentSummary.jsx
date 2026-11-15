function PaymentSummary({ lecturerPayment }) {
  if (!lecturerPayment) {
    return (
      <div className="payment-summary ps-summary">
        <h2>סיכום תשלומים</h2>
        <p className="ps-summary-loading">טוענת נתוני תשלום...</p>
      </div>
    );
  }

  const facilitatorLevelText =
    lecturerPayment.facilitatorLevel === "young"
      ? "מנחה צעירה"
      : lecturerPayment.facilitatorLevel === "senior"
      ? "מנחה בוגרת"
      : "לא הוגדר";

  return (
    <div className="payment-summary ps-summary">
      <h2>סיכום תשלומים</h2>

      <dl className="ps-summary-list">
        <div>
          <dt>סוג מנחה</dt>
          <dd>{facilitatorLevelText}</dd>
        </div>

        <div>
          <dt>פגישות שאושרו</dt>
          <dd>{lecturerPayment.approvedMeetingsCount}</dd>
        </div>

        <div>
          <dt>תשלום לפגישה</dt>
          <dd>
            {lecturerPayment.paymentPerMeeting !== null
              ? `${Number(lecturerPayment.paymentPerMeeting).toLocaleString("he-IL")} ₪`
              : "לא הוגדר תעריף"}
          </dd>
        </div>
      </dl>

      <div className="ps-summary-total">
        <span>סה״כ לתשלום</span>
        <strong>
          {lecturerPayment.totalPayment !== null
            ? `${Number(lecturerPayment.totalPayment).toLocaleString("he-IL")} ₪`
            : "לא ניתן לחשב"}
        </strong>
      </div>
    </div>
  );
}

export default PaymentSummary;
