/*
  ניתוב לפי כתובת (URL) + תמיכה בחיצים של הדפדפן

  האפליקציה מחליפה עמודים לפי משתני state (showLessonsPage, coordinatorPage וכו').
  הקובץ הזה מתרגם בין ה-state לבין כתובת בדפדפן, בשני הכיוונים:
  - navToPath: מה-state -> כתובת (למשל '/coordinator/reports')
  - pathToNav: מכתובת -> state (כשלוחצים "אחורה" או מרעננים את הדף)
*/

// מצב ניווט "ריק" = דף הבית
export const HOME_NAV = {
  showLogin: false,
  showLessonsPage: false,
  showContactPage: false,
  showReportsPage: false,
  coordinatorPage: null,
  facilitatorPage: null,
}

// העמודים של הרכזת שיש להם כתובת
const COORDINATOR_PAGES = [
  'approvals',
  'reports',
  'payments',
  'settings',
  'contacts',
  'delivery',
  'meetings',
  'meetingApprovals',
]

// כתובות של עמודי המנחה
const FACILITATOR_PATHS = {
  menu: '/facilitator',
  'bank-details': '/facilitator/bank-details',
  messages: '/facilitator/messages',
}

/*
  state -> כתובת.
  הסדר כאן זהה לסדר הבדיקות ב-return של App, כדי שהכתובת תתאים בדיוק למה שמוצג.
*/
export function navToPath(nav, role) {
  if (nav.showLogin) return '/login'

  if (role === 'coordinator' && nav.coordinatorPage) {
    return nav.coordinatorPage === 'dashboard'
      ? '/coordinator'
      : `/coordinator/${nav.coordinatorPage}`
  }

  if (role === 'payment_manager') return '/payments'

  if (role === 'facilitator' && FACILITATOR_PATHS[nav.facilitatorPage]) {
    return FACILITATOR_PATHS[nav.facilitatorPage]
  }

  if (nav.showReportsPage) {
    return nav.facilitatorPage === 'new-report' ? '/reports/new' : '/reports'
  }

  if (nav.showContactPage) return '/contact'
  if (nav.showLessonsPage) return '/lessons'

  return '/'
}

/*
  כתובת -> state.
  בודק גם הרשאות: מי שלא מחוברת ומנסה להגיע לעמוד פנימי - תגיע למסך הכניסה.
*/
export function pathToNav(path, role) {
  const cleanPath = path.replace(/\/+$/, '') || '/'
  const parts = cleanPath.split('/').filter(Boolean)

  // עמודים שכל אחת יכולה לראות
  if (cleanPath === '/') return { ...HOME_NAV }
  if (cleanPath === '/contact') return { ...HOME_NAV, showContactPage: true }
  if (cleanPath === '/login') return { ...HOME_NAV, showLogin: !role }

  // מכאן והלאה - עמודים למשתמשות מחוברות בלבד
  if (!role) return { ...HOME_NAV, showLogin: true }

  if (cleanPath === '/lessons') {
    return {
      ...HOME_NAV,
      showLessonsPage: true,
      facilitatorPage: role === 'facilitator' ? 'lessons' : null,
    }
  }

  if (parts[0] === 'coordinator' && role === 'coordinator') {
    const page = parts[1]
    return {
      ...HOME_NAV,
      coordinatorPage: page && COORDINATOR_PAGES.includes(page) ? page : 'dashboard',
    }
  }

  if (parts[0] === 'facilitator' && role === 'facilitator') {
    const page = parts[1] === 'bank-details' || parts[1] === 'messages' ? parts[1] : 'menu'
    return { ...HOME_NAV, facilitatorPage: page }
  }

  if (parts[0] === 'reports') {
    return {
      ...HOME_NAV,
      showReportsPage: true,
      facilitatorPage:
        role === 'facilitator' ? (parts[1] === 'new' ? 'new-report' : 'reports') : null,
    }
  }

  if (cleanPath === '/payments' && role === 'payment_manager') return { ...HOME_NAV }

  // כתובת לא מוכרת או בלי הרשאה - דף הבית
  return { ...HOME_NAV }
}
