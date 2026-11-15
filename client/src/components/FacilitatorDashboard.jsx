
function FacilitatorDashboard({ onNavigate }) {
  const dashboardItems = [
    {
      id: "reports",
      title: "הדיווחים שלי",
      description: "צפייה בדיווחי הפגישות ובסטטוס האישור והתשלום",
    },
    {
      id: "lessons",
      title: "מאגר מערכי השיעור",
      description: "צפייה במערכים, בתכנים ובקבצים המצורפים",
    },
    {
      id: "messages",
      title: "הודעות מהרכזת",
      description: "צפייה בהודעות ובעדכונים מהרכזת",
    },
    {
      id: "new-report",
      title: "דיווח על פגישה",
      description: "מילוי ושליחת דיווח על פגישה שהתקיימה",
    },
    {
      id: "bank-details",
      title: "פרטי חשבון בנק",
      description: "הוספה או עדכון מאובטח של פרטי החשבון",
    },
  ];

  return (
    <main className="coordinator-dashboard" dir="rtl">
      <header>
        <h1>האזור האישי של המנחה</h1>
        <p>ברוכה הבאה! בחרי את הפעולה שברצונך לבצע</p>
      </header>

      <section className="dashboard-grid">
        {dashboardItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="dashboard-item"
            onClick={() => onNavigate(item.id)}
          >
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span>כניסה לעמוד ←</span>
          </button>
        ))}
      </section>
    </main>
  );
}

export default FacilitatorDashboard;
