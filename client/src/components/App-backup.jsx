import { useEffect, useState } from 'react'
import './App.css'
import PreviewModal from './components/PreviewModal'
import LessonCard from './components/LessonCard'
import HomePage from './components/HomePage'
import ContactPage from './components/ContactPage'

const API_URL = 'http://localhost:7001/api/lessons'

const EMPTY_FORM = {
  title: '',
  description: '',
  track: '',
  content: '',
  notes: '',
}

function App() {
  const [showLessonsPage, setShowLessonsPage] = useState(false)
  const [showContactPage, setShowContactPage] = useState(false)

  const [lessons, setLessons] = useState([])
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
  const [showCoordinatorView, setShowCoordinatorView] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [contentFile, setContentFile] = useState(null)
  const [attachmentFiles, setAttachmentFiles] = useState([])

  // טעינת מערכי השיעור בהתאם לתצוגה, לחיפוש ולמסלול
  useEffect(() => {
    let cancelled = false

    async function fetchLessons() {
      try {
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

        const response = await fetch(url)
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
  }, [search, track, showCoordinatorView])

  // פתיחת קובץ לתצוגה מקדימה
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

  // ניקוי כתובת PDF זמנית
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

    const response = await fetch(url)
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

      if (contentFile) uploadedContentFile = await uploadFile(contentFile)

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

  return (
    <main className="page" dir="rtl">
      {showContactPage ? (
        <>
          <button
            type="button"
            className="back-home-button"
            onClick={() => {
              setShowContactPage(false)
              setShowLessonsPage(false)
            }}
          >
            ← חזרה לדף הבית
          </button>
          <ContactPage />
        </>
      ) : !showLessonsPage ? (
        <HomePage
          onShowLessons={() => {
            setShowContactPage(false)
            setShowLessonsPage(true)
          }}
          onShowContact={() => setShowContactPage(true)}
        />
      ) : (
        <>
          <button
            type="button"
            className="back-home-button"
            onClick={() => {
              setShowLessonsPage(false)
              setShowContactPage(false)
            }}
          >
            ← חזרה לדף הבית
          </button>

          <header className="lessons-header">
            <h1>מאגר מערכי השיעור</h1>
            <p>חיפוש, צפייה ושיתוף ידע בין מנחים</p>
          </header>

          <section className="lesson-filters" aria-label="חיפוש וסינון שיעורים">
            <label>
              חיפוש מערך שיעור
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="חיפוש לפי שם או תיאור..."
              />
            </label>
            <label>
              סינון לפי מסלול
              <select value={track} onChange={(event) => setTrack(event.target.value)}>
                <option value="">כל המסלולים</option>
                <option value="פיתוח">פיתוח</option>
                <option value="ארוך">מסלול ארוך</option>
                <option value="קצר">מסלול קצר</option>
                <option value="קיץ">מסלול קיץ</option>
              </select>
            </label>
          </section>

          <section className="admin-section">
            <div className="admin-toolbar">
              <button
                type="button"
                onClick={() => {
                  setShowCoordinatorView((previous) => !previous)
                  setShowAdminForm(false)
                  setSaveMessage('')
                  setSaveError('')
                }}
              >
                {showCoordinatorView
                  ? 'מעבר לתצוגת מנחה'
                  : 'תצוגת רכזת'}
              </button>

              {showCoordinatorView && (
                <button
                  type="button"
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
            </div>

            {showCoordinatorView && showAdminForm && (
              <form className="lesson-form" onSubmit={handleSaveLesson}>
                <h2>
                  {editingLessonId ? 'עריכת מערך שיעור' : 'הוספת מערך שיעור חדש'}
                </h2>

                <label>
                  שם מערך השיעור *
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    maxLength={200}
                  />
                </label>

                <label>
                  תיאור קצר
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </label>

                <label>
                  מסלול *
                  <select
                    name="track"
                    value={formData.track}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">בחירת מסלול</option>
                    <option value="פיתוח">פיתוח</option>
                    <option value="ארוך">ארוך</option>
                    <option value="קצר">קצר</option>
                    <option value="קיץ">קיץ</option>
                  </select>
                </label>

                <label>
                  תוכן השיעור
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    rows={6}
                    placeholder="אפשר לכתוב כאן את תוכן השיעור..."
                  />
                </label>

                <label>
                  הערות למנחה
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </label>

                <label>
                  קובץ תוכן השיעור (לא חובה)
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(event) => setContentFile(event.target.files?.[0] || null)}
                  />
                </label>

                <label>
                  קבצים מצורפים (אפשר לבחור כמה)
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={(event) => setAttachmentFiles(Array.from(event.target.files || []))}
                  />
                </label>

                {saveError && <p className="status-message error">{saveError}</p>}
                {saveMessage && <p className="status-message">{saveMessage}</p>}

                <div className="lesson-form-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? 'שומר...' : editingLessonId ? 'שמירת שינויים' : 'שמירת מערך השיעור'}
                  </button>
                  <button type="button" onClick={resetLessonForm} disabled={saving}>
                    ביטול
                  </button>
                </div>
              </form>
            )}

            {!showAdminForm && saveMessage && (
              <p className="status-message">{saveMessage}</p>
            )}
          </section>

          {loading ? (
            <p className="status-message">טוען מערכי שיעור...</p>
          ) : error ? (
            <p className="status-message error">{error}</p>
          ) : lessons.length === 0 ? (
            <p className="status-message">לא נמצאו מערכי שיעור מתאימים.</p>
          ) : (
            <section className="lessons-grid" aria-label="מערכי שיעור">
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
                />
              ))}
            </section>
          )}

          <PreviewModal
            previewFile={previewFile}
            previewHtml={previewHtml}
            previewPdfUrl={previewPdfUrl}
            previewLoading={previewLoading}
            previewError={previewError}
            onClose={closePreview}
          />
        </>
      )}
    </main>
  )
}

export default App
