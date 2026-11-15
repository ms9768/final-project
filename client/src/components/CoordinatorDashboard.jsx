import PageShell from './ui/PageShell'
import DashboardTiles from './ui/DashboardTiles'

// האריחים מחולקים לקבוצות לפי תחום, כדי שיהיה קל למצוא
const dashboardGroups = [
  {
    title: 'מנחות ופגישות',
    tone: 'purple',
    items: [
      {
        id: 'approvals',
        title: 'בקשות הרשמה',
        description: 'צפייה ואישור של מנחות חדשות',
      },
      {
        id: 'reports',
        title: 'דיווחי פגישות',
        description: 'צפייה בדיווחים, אישור והחזרה לתיקון',
      },
      {
        id: 'meetings',
        title: 'קביעת פגישות',
        description: 'ניהול ימים, שעות ובקשות לקביעת פגישות',
      },
      {
        id: 'meetingApprovals',
        title: 'אישור פגישות',
        description: 'צפייה בבקשות והחלטה אם לאשר או לדחות',
      },
    ],
  },
  {
    title: 'תוכן',
    tone: 'mint',
    items: [
      {
        id: 'lessons',
        title: 'מאגר מערכי השיעור',
        description: 'צפייה, הוספה ועריכה של מערכים',
      },
    ],
  },
  {
    title: 'כספים והגדרות',
    tone: 'yellow',
    items: [
      {
        id: 'payments',
        title: 'תשלומים למנחות',
        description: 'סיכומי תשלומים וחישוב שכר',
      },
      {
        id: 'settings',
        title: 'הגדרות מערכת',
        description: 'תקציב כיבוד ותעריפי תשלום',
      },
    ],
  },
  {
    title: 'פניות ומשלוחים',
    tone: 'lilac',
    items: [
      {
        id: 'contacts',
        title: 'ניהול פניות ומיילים',
        description: 'טיפול בפניות ושליחת הודעות במייל',
      },
      {
        id: 'delivery',
        title: 'טופס למשלוחן',
        description: 'פתיחת טופס משלוח וניהול פרטי המשלוח',
      },
    ],
  },
]

function CoordinatorDashboard({ onNavigate, userName }) {
  return (
    <PageShell
      className="db-page"
      eyebrow="לוח הבקרה של הרכזת"
      title={userName ? `שלום, ${userName.split(' ')[0]}!` : 'לוח הבקרה של הרכזת'}
      subtitle="בחירת תחום לניהול במערכת"
    >
      <DashboardTiles groups={dashboardGroups} onNavigate={onNavigate} />
    </PageShell>
  )
}

export default CoordinatorDashboard
