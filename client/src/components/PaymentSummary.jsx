function PaymentSummary({ lecturerPayment }) {
  if (!lecturerPayment) {
    return <p>טוענת נתוני תשלום...</p>;
  }

  return (
    <div className="payment-summary">
      <h2>סיכום תשלומים</h2>

      <p>
        <strong>מספר פגישות שאושרו:</strong>{" "}
        {lecturerPayment.approvedMeetingsCount}
      </p>

      <p>
        <strong>תשלום עבור כל פגישה:</strong>{" "}
        {lecturerPayment.paymentPerMeeting} ₪
      </p>

      <h3>
        סה״כ לתשלום: {lecturerPayment.totalPayment} ₪
      </h3>
    </div>
  );
}

export default PaymentSummary;