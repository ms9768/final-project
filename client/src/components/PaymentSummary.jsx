
function PaymentSummary({ lecturerPayment }) {
  if (!lecturerPayment) {
    return <p>טוענת נתוני תשלום...</p>;
  }

  const facilitatorLevelText =
    lecturerPayment.facilitatorLevel === "young"
      ? "מנחה צעירה"
      : lecturerPayment.facilitatorLevel === "senior"
      ? "מנחה בוגרת"
      : "לא הוגדר";

  return (
    <div className="payment-summary">
      <h2>סיכום תשלומים</h2>

      <p>
        <strong>סוג מנחה:</strong>{" "}
        {facilitatorLevelText}
      </p>

      <p>
        <strong>מספר פגישות שאושרו:</strong>{" "}
        {lecturerPayment.approvedMeetingsCount}
      </p>

      <p>
        <strong>תשלום עבור כל פגישה:</strong>{" "}
        {lecturerPayment.paymentPerMeeting !== null
          ? `${lecturerPayment.paymentPerMeeting} ₪`
          : "לא הוגדר תעריף"}
      </p>

      <h3>
        סה״כ לתשלום:{" "}
        {lecturerPayment.totalPayment !== null
          ? `${lecturerPayment.totalPayment} ₪`
          : "לא ניתן לחשב"}
      </h3>
    </div>
  );
}

export default PaymentSummary;
