
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { navToPath, pathToNav } from './navigation'
import PreviewModal from './components/PreviewModal'
import LessonCard from './components/LessonCard'
import LessonDetails from './components/LessonDetails'
import HomePage from './components/HomePage'
import PageShell from './components/ui/PageShell'
import characterImage from './assets/character.png'
import './components/LessonsPage.css'
import ContactPage from './components/ContactPage'
import ContactManagement from './components/ContactManagement'
import AuthPage from './components/AuthPage'
import PendingApprovals from './components/PendingApprovals'
import MeetingReportsPage from './MeetingReportsPage'
import CoordinatorDashboard from './components/CoordinatorDashboard'
import SystemSettings from './components/SystemSettings'
import LecturersPaymentsPage from './components/LecturersPaymentsPage'
import DeliveryForm from './components/DeliveryForm'
import DeliveryPersonPage from './components/DeliveryPersonPage'
import FacilitatorDashboard from './components/FacilitatorDashboard'
import PaymentManagementPage from './components/PaymentManagementPage'
import BankDetailsForm from './components/BankDetailsForm'

const API_URL = 'http://localhost:7001/api/lessons'

// כפתורי הסינון לפי מסלול בעמוד המאגר
const TRACK_FILTERS = [
  { value: '', label: 'כל המסלולים', className: 'lp-chip-all' },
  { value: 'ארוך', label: 'מסלול ארוך', className: 'track-long' },
  { value: 'קצר', label: 'מסלול קצר', className: 'track-short' },
  { value: 'קיץ', label: 'מסלול קיץ', className: 'track-summer' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  track: '',
  content: '',
  notes: '',
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('currentUser')) || null
    } catch {
      return null
    }
  })

  function handleLogout() {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('currentUser')
    setCurrentUser(null)
    setShowLogin(false)
    setShowLessonsPage(false)
    setShowContactPage(false)
    setShowReportsPage(false)
  }


  const lessonIdFromUrl = new URLSearchParams(window.location.search).get('lessonId')
  const isCoordinatorFromUrl =
    new URLSearchParams(window.location.search).get('coordinator') === 'true'
  const deliveryToken = window.location.pathname.startsWith('/delivery/')
    ? decodeURIComponent(window.location.pathname.split('/')[2] || '') : ''
  const isBankDetailsPath = window.location.pathname === '/bank-details'
  const bankDetailsToken = isBankDetailsPath
    ? decodeURIComponent(window.location.hash.slice(1))
    : ''

  const [openedLesson, setOpenedLesson] = useState(null)
  const [detailLoading, setDetailLoading] = useState(Boolean(lessonIdFromUrl))
  const [detailError, setDetailError] = useState('')


  useEffect(() => {
    if (!lessonIdFromUrl) return

    let cancelled = false

    async function fetchOpenedLesson() {
      try {
        setDetailLoading(true)
        setDetailError('')

        const response = await fetch(`${API_URL}/${lessonIdFromUrl}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken') || ''}`,
          },
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'לא ניתן לטעון את פרטי מערך השיעור')
        }

        if (!cancelled) setOpenedLesson(data)
      } catch (err) {
        if (!cancelled) {
          setDetailError(err.message || 'אירעה שגיאה בטעינת מערך השיעור')
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }

    fetchOpenedLesson()

    return () => {
      cancelled = true
    }
  }, [lessonIdFromUrl])

  const [showLessonsPage, setShowLessonsPage] = useState(false)
  const [showContactPage, setShowContactPage] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showReportsPage, setShowReportsPage] = useState(false)
  const [facilitatorPage, setFacilitatorPage] = useState(() =>
    currentUser?.role === 'facilitator' ? 'menu' : null
  )

  const [lessons, setLessons] = useState([])
  const [facilitators, setFacilitators] = useState([])
  const [accessLoading, setAccessLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [track, setTrack] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [previewFile, setPreviewFile] = useState(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')

  const [showAdminForm, setShowAdminForm] = useState(false)
  const showCoordinatorView = currentUser?.role === 'coordinator'
  const [showContactManagement, setShowContactManagement] = useState(false)
  const [showPendingApprovals, setShowPendingApprovals] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [contentFile, setContentFile] = useState(null)
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [coordinatorPage, setCoordinatorPage] = useState(null)

  /* ---------- ניתוב: חיבור בין העמוד המוצג לכתובת בדפדפן ---------- */

  // עמודים מיוחדים (מערך בלשונית חדשה, משלוחן, פרטי בנק) לא משתתפים בניתוב
  const isSpecialPage = Boolean(lessonIdFromUrl || deliveryToken || isBankDetailsPath)

  const navState = {
    showLogin,
    showLessonsPage,
    showContactPage,
    showReportsPage,
    coordinatorPage,
    facilitatorPage,
  }
  const currentPath = navToPath(navState, currentUser?.role)

  // מעדכן את כל משתני הניווט בבת אחת
  function applyNav(nav) {
    setShowLogin(nav.showLogin)
    setShowLessonsPage(nav.showLessonsPage)
    setShowContactPage(nav.showContactPage)
    setShowReportsPage(nav.showReportsPage)
    setCoordinatorPage(nav.coordinatorPage)
    setFacilitatorPage(nav.facilitatorPage)
  }

  // כשהמצב הראשוני נקבע מהכתובת, מדלגים על סנכרון אחד (כדי לא לדרוס את הכתובת)
  const skipNextSyncRef = useRef(false)

  // 1. בטעינה: אם נכנסו ישר לכתובת פנימית (או רעננו את הדף) - פותחים את העמוד המתאים
  useEffect(() => {
    if (isSpecialPage) return

    const navFromUrl = pathToNav(window.location.pathname, currentUser?.role)

    if (navToPath(navFromUrl, currentUser?.role) !== currentPath) {
      skipNextSyncRef.current = true
      applyNav(navFromUrl)
    }
    // רץ פעם אחת בטעינה בלבד
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. כל מעבר עמוד באפליקציה -> רשומה חדשה בהיסטוריה של הדפדפן
  useEffect(() => {
    if (isSpecialPage) return

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }

    const entry = { nav: navState }
    const fromPath = window.location.pathname

    if (fromPath === currentPath) {
      // אותה כתובת (למשל אחרי "אחורה") - רק שומרים את המצב, בלי רשומה חדשה
      window.history.replaceState(entry, '', currentPath + window.location.hash)
    } else if (fromPath === '/login' && currentPath !== '/login') {
      // אחרי התחברות: מחליפים את מסך הכניסה, כדי ש"אחורה" לא יחזיר אליו
      window.history.replaceState(entry, '', currentPath)
    } else {
      window.history.pushState(entry, '', currentPath)
    }
    // navState מחושב מחדש בכל רינדור; currentPath מספיק כדי לזהות מעבר עמוד
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath])

  // 3. חיצים של הדפדפן (אחורה / קדימה) -> מחזירים את העמוד ששמור ברשומה
  useEffect(() => {
    if (isSpecialPage) return

    function handlePopState(event) {
      const role = JSON.parse(sessionStorage.getItem('currentUser') || 'null')?.role
      const savedNav = event.state?.nav

      // רשומה שמורה - אבל רק אם היא עדיין מתאימה להרשאות (למשל אחרי התנתקות)
      const nav =
        savedNav && navToPath(savedNav, role) === navToPath(pathToNav(window.location.pathname, role), role)
          ? savedNav
          : pathToNav(window.location.pathname, role)

      applyNav(nav)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  useEffect(() => {
    async function fetchFacilitators() {
      if (currentUser?.role !== 'coordinator') return

      try {
        const response = await fetch('http://localhost:7001/api/users', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken') || ''}`,
          },
        })

        if (!response.ok) {
          throw new Error('שגיאה בטעינת רשימת המנחות')
        }

        const data = await response.json()
        setFacilitators(data)
      } catch (error) {
        console.error('שגיאה בטעינת מנחות:', error)
      }
    }

    fetchFacilitators()
  }, [currentUser])

  useEffect(() => {
    let cancelled = false

    async function fetchLessons() {
      try {
        const token = sessionStorage.getItem('authToken')

        if (!token || !currentUser) {
          setLessons([])
          setLoading(false)
          return
        }

        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (search.trim()) params.set('search', search.trim())
        if (track) params.set('track', track)

        const query = params.toString()
        const url = showCoordinatorView
          ? `${API_URL}/admin/all${query ? `?${query}` : ''}`
          : query
            ? `${API_URL}?${query}`
            : API_URL

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken') || ''}`,
          },
        })
        if (!response.ok) throw new Error('Failed to load lessons')

        const data = await response.json()
        if (!cancelled) setLessons(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) {
          setError('לא ניתן לטעון את מערכי השיעור. בדקי שהשרת פועל.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLessons()

    return () => {
      cancelled = true
    }
  }, [search, track, showCoordinatorView, currentUser])

  async function openPreview(file) {
    if (!file?.url) {
      setPreviewError('לא נמצא קישור לקובץ.')
      setPreviewFile(file || null)
      return
    }

    setPreviewFile(file)
    setPreviewHtml('')
    setPreviewPdfUrl('')
    setPreviewError('')
    setPreviewLoading(true)

    try {
      const filename = file.url.split('/').pop()
      const response = await fetch(
        `${API_URL}/preview/${encodeURIComponent(filename)}`
      )

      if (!response.ok) {
        let message = 'לא ניתן להציג את הקובץ'

        try {
          const data = await response.json()
          message = data.message || message
        } catch {
          // התשובה אינה JSON
        }

        throw new Error(message)
      }

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('application/pdf')) {
        const blob = await response.blob()
        setPreviewPdfUrl(URL.createObjectURL(blob))
      } else {
        const data = await response.json()
        setPreviewHtml(data.html || '')
      }
    } catch (previewErr) {
      console.error('Preview failed:', previewErr)
      setPreviewError('לא הצלחנו להציג את הקובץ. אפשר לנסות להוריד אותו.')
    } finally {
      setPreviewLoading(false)
    }
  }

  function closePreview() {
    setPreviewFile(null)
    setPreviewHtml('')
    setPreviewPdfUrl('')
    setPreviewError('')
    setPreviewLoading(false)
  }

  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
    }
  }, [previewPdfUrl])

  function startEditLesson(lesson) {
    setEditingLessonId(lesson._id)

    setFormData({
      title: lesson.title || '',
      description: lesson.description || '',
      track: lesson.track || '',
      content: lesson.content || '',
      notes: lesson.notes || '',
    })

    setContentFile(null)
    setAttachmentFiles([])
    setSaveMessage('')
    setSaveError('')
    setShowAdminForm(true)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetLessonForm() {
    setFormData(EMPTY_FORM)
    setEditingLessonId(null)
    setContentFile(null)
    setAttachmentFiles([])
    setShowAdminForm(false)
    setSaveError('')
    setSaveMessage('')
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  async function uploadFile(file) {
    const data = new FormData()
    data.append('file', file)

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: data,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'העלאת הקובץ נכשלה')
    }

    return result.file
  }

  async function refreshLessons() {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (track) params.set('track', track)

    const query = params.toString()
    const url = showCoordinatorView
      ? `${API_URL}/admin/all${query ? `?${query}` : ''}`
      : query
        ? `${API_URL}?${query}`
        : API_URL

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('authToken') || ''}`,
      },
    })
    if (response.ok) {
      const data = await response.json()
      setLessons(Array.isArray(data) ? data : [])
    }
  }

  async function handleSaveLesson(event) {
    event.preventDefault()
    setSaving(true)
    setSaveMessage('')
    setSaveError('')

    try {
      const existingLesson = editingLessonId
        ? lessons.find((lesson) => lesson._id === editingLessonId)
        : null

      let uploadedContentFile = existingLesson?.contentFile || null
      const uploadedAttachments = existingLesson?.files
        ? [...existingLesson.files]
        : []

      if (contentFile) {
        uploadedContentFile = await uploadFile(contentFile)
      }

      for (const file of attachmentFiles) {
        uploadedAttachments.push(await uploadFile(file))
      }

      const lessonData = {
        ...formData,
        contentFile: uploadedContentFile,
        files: uploadedAttachments,
      }

      const response = await fetch(
        editingLessonId ? `${API_URL}/${editingLessonId}` : API_URL,
        {
          method: editingLessonId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'שמירת מערך השיעור נכשלה')
      }

      const wasEditing = Boolean(editingLessonId)
      resetLessonForm()

      setSaveMessage(
        wasEditing ? 'השינויים נשמרו בהצלחה!' : 'מערך השיעור נשמר בהצלחה!'
      )

      await refreshLessons()
    } catch (saveErr) {
      setSaveError(saveErr.message || 'אירעה שגיאה בשמירת המערך')
    } finally {
      setSaving(false)
    }
  }

  async function hideLesson(lessonId) {
    if (!window.confirm('האם להסתיר את מערך השיעור? הוא לא יימחק מהמערכת.')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${lessonId}/hide`, {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'הסתרת מערך השיעור נכשלה')
      }

      setLessons((previous) =>
        previous.filter((lesson) => lesson._id !== lessonId)
      )
    } catch (hideErr) {
      window.alert(hideErr.message || 'אירעה שגיאה בהסתרת המערך')
    }
  }

  async function showLesson(lessonId) {
    if (!window.confirm('האם להציג מחדש את מערך השיעור?')) return

    try {
      const response = await fetch(`${API_URL}/${lessonId}/show`, {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'הצגת מערך השיעור נכשלה')
      }

      await refreshLessons()
      window.alert('מערך השיעור חזר להיות גלוי')
    } catch (showErr) {
      window.alert(showErr.message || 'אירעה שגיאה בהצגת המערך')
    }
  }

  async function deleteLesson(lessonId) {
    if (
      !window.confirm(
        'האם למחוק את מערך השיעור לצמיתות? לא ניתן לבטל את הפעולה.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${lessonId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'מחיקת מערך השיעור נכשלה')
      }

      setLessons((previous) =>
        previous.filter((lesson) => lesson._id !== lessonId)
      )
    } catch (deleteErr) {
      window.alert(deleteErr.message || 'אירעה שגיאה במחיקת המערך')
    }
  }

  // פתיחת מערך שיעור בלשונית חדשה
  if (lessonIdFromUrl) {
    if (openedLesson && !detailLoading && !detailError) {
      return (
        <main className="app-shell" dir="rtl">
          <LessonDetails
            lesson={openedLesson}
            isCoordinator={isCoordinatorFromUrl}
            onPreview={openPreview}
          />

          <PreviewModal
            previewFile={previewFile}
            previewHtml={previewHtml}
            previewPdfUrl={previewPdfUrl}
            previewLoading={previewLoading}
            previewError={previewError}
            onClose={closePreview}
          />
        </main>
      )
    }

    return (
      <main className="hp ld-status" dir="rtl">
        <img src={characterImage} alt="" />
        {detailLoading ? (
          <p>טוען את פרטי מערך השיעור...</p>
        ) : detailError ? (
          <p className="hp-alert hp-alert-error" role="alert">
            <span aria-hidden="true">!</span>
            {detailError}
          </p>
        ) : (
          <p>לא נמצא מערך שיעור.</p>
        )}
      </main>
    )
  }
  if (deliveryToken) {
    return (
      <DeliveryPersonPage token={deliveryToken} />
    )
  }
  if (isBankDetailsPath) {
    return <BankDetailsForm token={bankDetailsToken} publicLink />
  }

  async function changeLessonAccess(lessonId, userId, closeAccess = false) {
    setAccessLoading(true)

    try {
      const url = `${API_URL}/${lessonId}/access/${userId}${closeAccess ? '/close' : ''}`

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken') || ''}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בעדכון הרשאות הגישה')
      }

      await refreshLessons()
      alert(data.message)
    } catch (error) {
      alert(error.message)
    } finally {
      setAccessLoading(false)
    }
  }

  function openLessonAccess(lessonId, userId) {
    return changeLessonAccess(lessonId, userId)
  }

  function closeLessonAccess(lessonId, userId) {
    return changeLessonAccess(lessonId, userId, true)
  }


  return (
    <main className="app-shell" dir="rtl">
      {currentUser && (
        <div className="user-toolbar">
          <span>
            שלום, {currentUser.fullName}
            {currentUser.role === 'coordinator'
              ? ' (רכזת)'
              : currentUser.role === 'payment_manager'
                ? ' (מנהלת תשלומים)'
                : ' (מנחה)'}
          </span>

          <button type="button" onClick={handleLogout}>
            התנתקות
          </button>
        </div>
      )}

      {showLogin ? (
        <AuthPage
          onBack={() => setShowLogin(false)}
          onLogin={(user) => {
            setCurrentUser(user)
            setShowLogin(false)
            setShowContactPage(false)
            setShowReportsPage(false)

            if (user.role === 'coordinator') {
              setCoordinatorPage('dashboard')
              setShowLessonsPage(false)
            } else if (user.role === 'facilitator') {
              setCoordinatorPage(null)
              setFacilitatorPage('menu')
              setShowLessonsPage(false)
              setShowContactPage(false)
              setShowReportsPage(false)
            } else {
              setCoordinatorPage(null)
              setFacilitatorPage(null)
              setShowLessonsPage(false)
              setShowContactPage(false)
              setShowReportsPage(false)
            }
          }}
        />
      ) : currentUser?.role === 'coordinator' &&
        coordinatorPage !== null ? (
        coordinatorPage === 'dashboard' ? (
          <CoordinatorDashboard
            userName={currentUser?.fullName}
            onNavigate={(page) => {
              if (page === 'lessons') {
                setCoordinatorPage(null)
                setShowLessonsPage(true)
                setShowContactPage(false)
                setShowReportsPage(false)
              } else {
                setCoordinatorPage(page)
              }
            }}
          />

        ) : coordinatorPage === 'approvals' ? (
          <PageShell
            eyebrow="מנחות ופגישות"
            title="בקשות הרשמה"
            subtitle="אישור מנחות חדשות שנרשמו עם קוד הרכזת"
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          >
            <PendingApprovals
              authToken={sessionStorage.getItem('authToken') || ''}
            />
          </PageShell>
        ) : coordinatorPage === 'contacts' ? (
          <PageShell
            eyebrow="פניות ומשלוחים"
            title="פניות שהתקבלו"
            subtitle="הפניות שנשלחו דרך טופס יצירת הקשר באתר"
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          >
            <ContactManagement
              authToken={sessionStorage.getItem('authToken') || ''}
            />
          </PageShell>
        ) : coordinatorPage === 'reports' ? (
          <MeetingReportsPage
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          />
        ) : coordinatorPage === 'payments' ? (
          <PageShell
            eyebrow="כספים והגדרות"
            title="תשלומים למנחות"
            subtitle="סיכום התשלומים עבור הפגישות שאושרו"
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          >
            <LecturersPaymentsPage />
          </PageShell>
        ) : coordinatorPage === 'settings' ? (
          <PageShell
            eyebrow="כספים והגדרות"
            title="הגדרות מערכת"
            subtitle="תעריפים, תקציבים והגדרות משלוח"
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          >
            <SystemSettings />
          </PageShell>
        ) : coordinatorPage === 'delivery' ? (
          <PageShell
            eyebrow="פניות ומשלוחים"
            title="ניהול משלוחים"
            subtitle="יצירת בקשות משלוח ומעקב אחר ביצוען"
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          >
            <DeliveryForm />
          </PageShell>
        ) : (
          <PageShell
            eyebrow="בקרוב"
            title={coordinatorPage === 'meetings' ? 'קביעת פגישות' : coordinatorPage === 'meetingApprovals' ? 'אישור פגישות' : 'בקרוב'}
            subtitle="העמוד הזה עדיין בבנייה"
            backLabel="חזרה ללוח הבקרה"
            onBack={() => setCoordinatorPage('dashboard')}
          >
            <div className="hp-soon">
              <img src={characterImage} alt="" />
              <h2>העמוד עדיין בתהליך חיבור</h2>
              <p>נחבר את העמוד שנבחר בשלב הבא.</p>
            </div>
          </PageShell>

        )
      ) : currentUser?.role === 'payment_manager' ? (
        <PaymentManagementPage />
      ) : currentUser?.role === 'facilitator' && facilitatorPage === 'menu' ? (
        <FacilitatorDashboard
          userName={currentUser?.fullName}
          onNavigate={(page) => {
            if (page === 'reports') {
              setFacilitatorPage('reports')
              setShowReportsPage(true)
            } else if (page === 'lessons') {
              setFacilitatorPage('lessons')
              setShowLessonsPage(true)
            } else if (page === 'messages') {
              setFacilitatorPage('messages')
            } else if (page === 'new-report') {
              setFacilitatorPage('new-report')
              setShowReportsPage(true)
            } else if (page === 'bank-details') {
              setFacilitatorPage('bank-details')
            }
          }}
        />
      ) : currentUser?.role === 'facilitator' &&
        facilitatorPage === 'bank-details' ? (
        <PageShell
          eyebrow="הפרטים שלי"
          title="פרטי חשבון בנק"
          subtitle="לאן יועברו התשלומים עבור הפגישות"
          backLabel="חזרה לאזור האישי"
          onBack={() => setFacilitatorPage('menu')}
        >
          <BankDetailsForm />
        </PageShell>
      ) : currentUser?.role === 'facilitator' && facilitatorPage === 'messages' ? (
        <PageShell
          eyebrow="האזור האישי"
          title="הודעות מהרכזת"
          subtitle="עדכונים והודעות מהרכזת"
          backLabel="חזרה לאזור האישי"
          onBack={() => setFacilitatorPage('menu')}
        >
          <div className="hp-soon">
            <img src={characterImage} alt="" />
            <h2>בקרוב כאן</h2>
            <p>נחבר לכאן את מערכת ההודעות.</p>
          </div>
        </PageShell>
      ) : showReportsPage ? (
        <MeetingReportsPage
          initialShowForm={facilitatorPage === 'new-report'}
          backLabel="חזרה לאזור האישי"
          onBack={() => {
            setShowReportsPage(false)
            setFacilitatorPage('menu')
          }}
        />
      ) : showContactPage ? (
        <ContactPage
          onBack={() => {
            setShowContactPage(false)
            setShowLessonsPage(false)
          }}
        />
      ) : !showLessonsPage ? (
        <>
          <HomePage
            onShowLessons={() => {
              if (!currentUser) {
                setShowLogin(true)
                return
              }

              setShowContactPage(false)
              setShowReportsPage(false)
              setShowLessonsPage(true)
            }}
            onShowContact={() => {
              setShowLogin(false)
              setShowLessonsPage(false)
              setShowReportsPage(false)
              setShowContactPage(true)
            }}
            onShowLogin={() => setShowLogin(true)}
          />

          {currentUser?.role === 'facilitator' && (
            <div className="hp hp-home-shortcut">
              <button
                type="button"
                className="hp-btn hp-btn-purple"
                onClick={() => {
                  setShowContactPage(false)
                  setShowLessonsPage(false)
                  setShowLogin(false)
                  setShowReportsPage(true)
                }}
              >
                כניסה למערכת דיווחי פגישות
              </button>
            </div>
          )}
        </>
      ) : (
        <PageShell
          className="lp"
          eyebrow={showCoordinatorView ? 'ניהול המאגר' : 'המאגר שלנו'}
          title="מאגר מערכי השיעור"
          subtitle="חיפוש, צפייה ושיתוף ידע בין מנחים"
          backLabel={
            showCoordinatorView
              ? 'חזרה ללוח הבקרה'
              : currentUser?.role === 'facilitator'
                ? 'חזרה לאזור האישי'
                : 'חזרה לדף הבית'
          }
          onBack={() => {
            setShowLessonsPage(false)
            setShowContactPage(false)
            setShowReportsPage(false)

            if (showCoordinatorView) {
              setCoordinatorPage('dashboard')
            } else if (currentUser?.role === 'facilitator') {
              setFacilitatorPage('menu')
            }
          }}
        >
          {/* ---------- חיפוש וסינון ---------- */}
          <section className="lp-filters" aria-label="חיפוש וסינון שיעורים">
            <label className="lp-search">
              <span className="lp-visually-hidden">חיפוש מערך שיעור</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="חיפוש לפי שם או תיאור..."
              />
            </label>

            <div className="lp-chips" role="group" aria-label="סינון לפי מסלול">
              {TRACK_FILTERS.map((option) => (
                <button
                  key={option.value || 'all'}
                  type="button"
                  className={`lp-chip ${option.className} ${track === option.value ? 'is-active' : ''}`}
                  aria-pressed={track === option.value}
                  onClick={() => setTrack(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {showCoordinatorView && (
              <button
                type="button"
                className={`hp-btn ${showAdminForm ? 'hp-btn-outline' : 'hp-btn-mint'} lp-add`}
                onClick={() => {
                  if (showAdminForm) {
                    resetLessonForm()
                  } else {
                    setEditingLessonId(null)
                    setFormData(EMPTY_FORM)
                    setContentFile(null)
                    setAttachmentFiles([])
                    setSaveMessage('')
                    setSaveError('')
                    setShowAdminForm(true)
                  }
                }}
              >
                {showAdminForm ? 'ביטול הטופס' : '＋ הוספת מערך שיעור'}
              </button>
            )}
          </section>

          {/* ---------- טופס הוספה / עריכה (רכזת) ---------- */}
          {showCoordinatorView && showAdminForm && (
            <form className="lp-form" onSubmit={handleSaveLesson}>
              <h2>
                {editingLessonId ? 'עריכת מערך שיעור' : 'הוספת מערך שיעור חדש'}
              </h2>

              <div className="lp-form-grid">
                <label className="lp-field lp-field-wide">
                  <span>שם מערך השיעור *</span>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    maxLength={200}
                  />
                </label>

                <label className="lp-field">
                  <span>מסלול *</span>
                  <select
                    name="track"
                    value={formData.track}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">בחירת מסלול</option>
                    <option value="ארוך">ארוך</option>
                    <option value="קצר">קצר</option>
                    <option value="קיץ">קיץ</option>
                  </select>
                </label>

                <label className="lp-field">
                  <span>תיאור קצר</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </label>

                <label className="lp-field lp-field-wide">
                  <span>תוכן השיעור</span>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    rows={6}
                    placeholder="אפשר לכתוב כאן את תוכן השיעור..."
                  />
                </label>

                <label className="lp-field lp-field-wide">
                  <span>הערות למנחה</span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </label>

                <label className="lp-field lp-file">
                  <span>קובץ תוכן השיעור (לא חובה)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(event) =>
                      setContentFile(event.target.files?.[0] || null)
                    }
                  />
                </label>

                <label className="lp-field lp-file">
                  <span>קבצים מצורפים (אפשר לבחור כמה)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={(event) =>
                      setAttachmentFiles(Array.from(event.target.files || []))
                    }
                  />
                </label>
              </div>

              {saveError && (
                <p className="hp-alert hp-alert-error" role="alert">
                  <span aria-hidden="true">!</span>
                  {saveError}
                </p>
              )}

              {saveMessage && (
                <p className="hp-alert hp-alert-success" role="status">
                  <span aria-hidden="true">✓</span>
                  {saveMessage}
                </p>
              )}

              <div className="lp-form-actions">
                <button type="submit" className="hp-btn hp-btn-purple" disabled={saving}>
                  {saving
                    ? 'שומר...'
                    : editingLessonId
                      ? 'שמירת שינויים'
                      : 'שמירת מערך השיעור'}
                </button>

                <button
                  type="button"
                  className="hp-btn hp-btn-outline"
                  onClick={resetLessonForm}
                  disabled={saving}
                >
                  ביטול
                </button>
              </div>
            </form>
          )}

          {!showAdminForm && saveMessage && (
            <p className="hp-alert hp-alert-success" role="status">
              <span aria-hidden="true">✓</span>
              {saveMessage}
            </p>
          )}

          {/* ---------- רשימת המערכים ---------- */}
          {loading ? (
            <p className="lp-state">טוען מערכי שיעור...</p>
          ) : error ? (
            <p className="hp-alert hp-alert-error" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          ) : lessons.length === 0 ? (
            <div className="lp-empty">
              <img src={characterImage} alt="" />
              <p>לא נמצאו מערכי שיעור מתאימים.</p>
            </div>
          ) : (
            <>
              <p className="lp-count">
                {lessons.length === 1 ? 'נמצא מערך אחד' : `נמצאו ${lessons.length} מערכים`}
              </p>

              <section className="lp-grid" aria-label="מערכי שיעור">
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson._id}
                    lesson={lesson}
                    onPreview={openPreview}
                    onHide={hideLesson}
                    onShow={showLesson}
                    onDelete={deleteLesson}
                    onEdit={startEditLesson}
                    showManagementButtons={showCoordinatorView}
                    facilitators={facilitators}
                    onOpenAccess={openLessonAccess}
                    onCloseAccess={closeLessonAccess}
                    accessLoading={accessLoading}
                  />
                ))}
              </section>
            </>
          )}

          <PreviewModal
            previewFile={previewFile}
            previewHtml={previewHtml}
            previewPdfUrl={previewPdfUrl}
            previewLoading={previewLoading}
            previewError={previewError}
            onClose={closePreview}
          />
        </PageShell>
      )}
    </main>
  )
}

export default App
