import { useEffect, useState } from 'react'
import './App.css'
import PreviewModal from './components/PreviewModal'
import LessonCard from './components/LessonCard'

const API_URL = 'http://localhost:7001/api/lessons'

function App() {
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
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    track: '',
    content: '',
    notes: '',
  })

  const [contentFile, setContentFile] = useState(null)
  const [attachmentFiles, setAttachmentFiles] = useState([])

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()

        if (search.trim()) {
          params.set('search', search.trim())
        }

        if (track) {
          params.set('track', track)
        }

        const query = params.toString()
        const url = query ? `${API_URL}?${query}` : API_URL

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to load lessons')
        }

        const data = await response.json()
        setLessons(data)
      } catch {
        setError('לא ניתן לטעון את מערכי השיעור. בדקי שהשרת פועל.')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [search, track])


  async function openPreview(file) {
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
        const pdfUrl = URL.createObjectURL(blob)

        setPreviewPdfUrl(pdfUrl)
      } else {
        const data = await response.json()
        setPreviewHtml(data.html || '')
      }
    } catch (error) {
      console.error('Preview failed:', error)

      setPreviewError(
        'לא הצלחנו להציג את הקובץ. אפשר לנסות להוריד אותו.'
      )
    } finally {
      setPreviewLoading(false)
    }
  }



  function closePreview() {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl)
    }

    setPreviewFile(null)
    setPreviewHtml('')
    setPreviewPdfUrl('')
    setPreviewError('')
    setPreviewLoading(false)
  }



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

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }




  function handleFormChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
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

  async function handleSaveLesson(event) {
    event.preventDefault()

    setSaving(true)
    setSaveMessage('')
    setSaveError('')

    try {

      const existingLesson = editingLessonId
        ? lessons.find((lesson) => lesson._id === editingLessonId)
        : null

      let uploadedContentFile = existingLesson?.contentFile || {
        name: '',
        url: '',
      }

      const uploadedAttachments = existingLesson?.files
        ? [...existingLesson.files]
        : []


      if (contentFile) {
        uploadedContentFile = await uploadFile(contentFile)
      }

      for (const file of attachmentFiles) {
        const uploaded = await uploadFile(file)
        uploadedAttachments.push(uploaded)
      }

      const lessonData = {
        ...formData,
        contentFile: uploadedContentFile,
        files: uploadedAttachments,
      }

      const response = await fetch(
        editingLessonId
          ? `${API_URL}/${editingLessonId}`
          : API_URL,
        {
          method: editingLessonId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData),
        })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'שמירת מערך השיעור נכשלה')
      }

      setFormData({
        title: '',
        description: '',
        track: '',
        content: '',
        notes: '',
      })

      setEditingLessonId(null)
      setShowAdminForm(false)
      setContentFile(null)
      setAttachmentFiles([])
      setSaveMessage(
        editingLessonId
          ? 'השינויים נשמרו בהצלחה!'
          : 'מערך השיעור נשמר בהצלחה!'
      )

      // ניקוי שדות בחירת הקבצים בטופס
      event.target.reset()

      // טעינת הרשימה מחדש
      const lessonsResponse = await fetch(API_URL)

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json()
        setLessons(lessonsData)
      }
    } catch (error) {
      setSaveError(error.message || 'אירעה שגיאה בשמירת המערך')
    } finally {
      setSaving(false)
    }
  }


  async function hideLesson(lessonId) {
    const confirmed = window.confirm(
      'האם להסתיר את מערך השיעור? הוא לא יימחק מהמערכת.'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/${lessonId}/hide`,
        {
          method: 'PATCH',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'הסתרת מערך השיעור נכשלה'
        )
      }

      setLessons((previous) =>
        previous.filter((lesson) => lesson._id !== lessonId)
      )
    } catch (error) {
      window.alert(error.message || 'אירעה שגיאה בהסתרת המערך')
    }
  }

  async function deleteLesson(lessonId) {
    const confirmed = window.confirm(
      'האם למחוק את מערך השיעור לצמיתות? לא ניתן לבטל את הפעולה.'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/${lessonId}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'מחיקת מערך השיעור נכשלה'
        )
      }

      setLessons((previous) =>
        previous.filter((lesson) => lesson._id !== lessonId)
      )
    } catch (error) {
      window.alert(error.message || 'אירעה שגיאה במחיקת המערך')
    }
  }


  return (
    <main className="page" dir="rtl">
      <section className="admin-section">
        <button
          type="button"
          onClick={() => {
            setShowAdminForm((previous) => !previous)
            setSaveMessage('')
            setSaveError('')
          }}
        >
          {showAdminForm ? 'סגירת טופס הניהול' : 'הוספת מערך שיעור'}
        </button>

        {showAdminForm && (
          <form className="admin-form" onSubmit={handleSaveLesson}>
            <h2>
              {editingLessonId
                ? 'עריכת מערך שיעור'
                : 'הוספת מערך שיעור חדש'}
            </h2>

            <label htmlFor="lesson-title">שם מערך השיעור</label>
            <input
              id="lesson-title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="lesson-description">תיאור</label>
            <textarea
              id="lesson-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="lesson-track">מסלול</label>
            <select
              id="lesson-track"
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

            <label htmlFor="lesson-content">תוכן השיעור בטקסט</label>
            <textarea
              id="lesson-content"
              name="content"
              value={formData.content}
              onChange={handleFormChange}
              placeholder="אפשר להשאיר ריק אם מעלים מסמך"
            />

            <label htmlFor="lesson-content-file">
              מסמך המכיל את תוכן השיעור (Word או PDF)
            </label>
            <input
              id="lesson-content-file"
              type="file"
              accept=".doc,.docx,.pdf"
              onChange={(event) =>
                setContentFile(event.target.files?.[0] || null)
              }
            />

            <label htmlFor="lesson-notes">הנחיות והערות למנחה</label>
            <textarea
              id="lesson-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
            />

            <label htmlFor="lesson-attachments">קבצים מצורפים נוספים</label>
            <input
              id="lesson-attachments"
              type="file"
              accept=".doc,.docx,.pdf"
              multiple
              onChange={(event) =>
                setAttachmentFiles(Array.from(event.target.files || []))
              }
            />

            <button type="submit" disabled={saving}>
              {saving
                ? 'שומר...'
                : editingLessonId
                  ? 'שמירת השינויים'
                  : 'שמירת מערך השיעור'}
            </button>

            {saveMessage && (
              <p className="status-message">{saveMessage}</p>
            )}

            {saveError && (
              <p className="status-message error">{saveError}</p>
            )}
          </form>
        )}
      </section>
      <header className="page-header">
        <div>
          <p className="eyebrow">מאגר ידע ולמידה</p>
          <h1>מערכי שיעור</h1>
          <p className="subtitle">כל חומרי הלמידה במקום אחד</p>
        </div>
      </header>

      <section className="filters">
        <div className="field">
          <label htmlFor="lesson-search">חיפוש שיעור</label>
          <input
            id="lesson-search"
            type="search"
            placeholder="חפשי לפי שם או תיאור..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="track-filter">סינון לפי מסלול</label>
          <select
            id="track-filter"
            value={track}
            onChange={(event) => setTrack(event.target.value)}
          >
            <option value="">כל המסלולים</option>
            <option value="פיתוח">פיתוח</option>
          </select>
        </div>
      </section>

      {loading && (
        <p className="status-message">טוען מערכי שיעור...</p>
      )}

      {!loading && error && (
        <p className="status-message error">{error}</p>
      )}

      {!loading && !error && lessons.length === 0 && (
        <p className="status-message">
          לא נמצאו מערכי שיעור מתאימים.
        </p>
      )}

      {!loading && !error && lessons.length > 0 && (
        <>
          <p className="results-count">
            נמצאו {lessons.length} מערכי שיעור
          </p>


          <section className="lessons-grid">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onPreview={openPreview}
                onHide={hideLesson}
                onDelete={deleteLesson}
                onEdit={startEditLesson}
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

    </main>
  )
}

export default App
