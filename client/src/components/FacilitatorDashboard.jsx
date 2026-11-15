import PageShell from './ui/PageShell'
import DashboardTiles from './ui/DashboardTiles'

// הפעולה הנפוצה ביותר מוצגת כאריח גדול בראש העמוד
const featuredItem = {
  id: 'new-report',
  title: 'דיווח על פגישה',
  description: 'מילוי ושליחת דיווח על פגישה שהתקיימה',
  cta: 'לדיווח חדש',
}

const dashboardGroups = [
  {
    title: 'העבודה שלי',
    tone: 'purple',
    items: [
      {
        id: 'reports',
        title: 'הדיווחים שלי',
        description: 'צפייה בדיווחי הפגישות ובסטטוס האישור והתשלום',
      },
      {
        id: 'lessons',
        title: 'מאגר מערכי השיעור',
        description: 'צפייה במערכים, בתכנים ובקבצים המצורפים',
      },
      {
        id: 'messages',
        title: 'הודעות מהרכזת',
        description: 'צפייה בהודעות ובעדכונים מהרכזת',
      },
    ],
  },
  {
    title: 'הפרטים שלי',
    tone: 'mint',
    items: [
      {
        id: 'bank-details',
        title: 'פרטי חשבון בנק',
        description: 'הוספה או עדכון מאובטח של פרטי החשבון',
      },
    ],
  },
]

function FacilitatorDashboard({ onNavigate, userName }) {
  return (
    <PageShell
      className="db-page"
      eyebrow="האזור האישי של המנחה"
      title={userName ? `ברוכה הבאה, ${userName.split(' ')[0]}!` : 'ברוכה הבאה!'}
      subtitle="בחרי את הפעולה שברצונך לבצע"
    >
      <DashboardTiles
        featured={featuredItem}
        groups={dashboardGroups}
        onNavigate={onNavigate}
      />
    </PageShell>
  )
}

export default FacilitatorDashboard
