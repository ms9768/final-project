import { useState } from 'react'
import { ArrowIcon, BookIcon, CalendarIcon, SunIcon } from './ui/Decor'

// לכל מסלול צבע ואייקון משלו (כמו בכרטיסי המסלולים בדף הבית)
const TRACK_STYLES = {
  'ארוך': { className: 'track-long', label: 'מסלול ארוך', Icon: BookIcon },
  'קצר': { className: 'track-short', label: 'מסלול קצר', Icon: CalendarIcon },
  'קיץ': { className: 'track-summer', label: 'מסלול קיץ', Icon: SunIcon },
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  )
}

function LessonCard({
  lesson,
  onHide,
  onShow,
  onDelete,
  onEdit,
  showManagementButtons,
  facilitators = [],
  onOpenAccess,
  onCloseAccess,
  accessLoading,
}) {
  const [selectedFacilitator, setSelectedFacilitator] = useState('')

  const trackStyle = TRACK_STYLES[lesson.track] || {
    className: 'track-none',
    label: lesson.track || 'ללא מסלול',
    Icon: BookIcon,
  }
  const { Icon } = trackStyle

  function openLessonDetails() {
    const params = new URLSearchParams()
    params.set('lessonId', lesson._id)

    if (showManagementButtons) {
      params.set('coordinator', 'true')
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    window.open(url, '_blank')
  }

  return (
    <article className={`lc ${trackStyle.className}`}>
      <div className="lc-top">
        <span className="lc-track">
          <Icon />
          {trackStyle.label}
        </span>

        {showManagementButtons && (
          <div className="lc-actions">
            <button
              type="button"
              className="lc-icon-button"
              onClick={() => onEdit(lesson)}
              title="עריכת מערך השיעור"
              aria-label="עריכת מערך השיעור"
            >
              <EditIcon />
            </button>

            <button
              type="button"
              className="lc-icon-button lc-delete"
              onClick={() => onDelete(lesson._id)}
              title="מחיקת מערך השיעור"
              aria-label="מחיקת מערך השיעור"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className="lc-title"
        onClick={openLessonDetails}
        aria-label={`פתיחת מערך השיעור ${lesson.title} בלשונית חדשה`}
      >
        <h2>{lesson.title}</h2>
      </button>

      <p className="lc-description">
        {lesson.description || 'אין תיאור למערך זה.'}
      </p>

      {showManagementButtons && (
        <div className="lc-access">
          <span className="lc-access-label">גישה למנחה</span>
          <select
            value={selectedFacilitator}
            onChange={(e) => setSelectedFacilitator(e.target.value)}
            aria-label="בחירת מנחה לניהול גישה"
          >
            <option value="">בחרי מנחה</option>
            {facilitators.map((facilitator) => (
              <option key={facilitator._id} value={facilitator._id}>
                {facilitator.fullName}
              </option>
            ))}
          </select>

          <div className="lc-access-buttons">
            <button
              type="button"
              className="lc-access-open"
              disabled={!selectedFacilitator || accessLoading}
              onClick={() => onOpenAccess(lesson._id, selectedFacilitator)}
            >
              פתיחת גישה
            </button>

            <button
              type="button"
              className="lc-access-close"
              disabled={!selectedFacilitator || accessLoading}
              onClick={() => onCloseAccess(lesson._id, selectedFacilitator)}
            >
              סגירת גישה
            </button>
          </div>
        </div>
      )}

      <button type="button" className="lc-open" onClick={openLessonDetails}>
        לפתיחת המערך המלא
        <ArrowIcon />
      </button>
    </article>
  )
}

export default LessonCard
