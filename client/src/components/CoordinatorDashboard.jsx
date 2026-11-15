
function CoordinatorDashboard({ onNavigate }) {
  const dashboardItems = [
    {
      id: "approvals",
      title: "בקשות הרשמה",
      description: "צפייה ואישור של מנחות חדשות",
    },
    {
      id: "reports",
      title: "דיווחי פגישות",
      description: "צפייה בדיווחים, אישור והחזרה לתיקון",
    },
    {
      id: "payments",
      title: "תשלומים למנחות",
      description: "סיכומי תשלומים וחישוב שכר",
    },
    {
      id: "settings",
      title: "הגדרות מערכת",
      description: "תקציב כיבוד ותעריפי תשלום",
    },
    {
      id: "contacts",
      title: "ניהול פניות ומיילים",
      description: "טיפול בפניות ושליחת הודעות במייל",
    },
    {
      id: "lessons",
      title: "מאגר מערכי השיעור",
      description: "צפייה, הוספה ועריכה של מערכים",
    },
    {
      id: "delivery",
      title: "טופס למשלוחן",
      description: "פתיחת טופס משלוח וניהול פרטי המשלוח",
    },
    {
      id: "meetings",
      title: "קביעת פגישות",
      description: "ניהול ימים, שעות ובקשות לקביעת פגישות",
    },
    {
      id: "meetingApprovals",
      title: "אישור פגישות",
      description: "צפייה בבקשות והחלטה אם לאשר או לדחות",
    },
  ];

  return (
    <main className="coordinator-dashboard" dir="rtl">
      <header>
        <h1>לוח הבקרה של הרכזת</h1>
        <p>בחירת תחום לניהול במערכת</p>
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

export default CoordinatorDashboard;
