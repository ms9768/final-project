import { useState } from 'react'

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
    <article className="lesson-card lesson-summary-card">
      {showManagementButtons && (
        <div className="lesson-management-actions">
          <button
            type="button"
            className="lesson-action-button edit-button"
            onClick={() => onEdit(lesson)}
            title="עריכת מערך השיעור"
            aria-label="עריכת מערך השיעור"
          >
            ✏️
          </button>

          {lesson.isVisible ? (
            <button
              type="button"
              className="lesson-action-button hide-button"
              onClick={() => onHide(lesson._id)}
              title="הסתרת מערך השיעור"
              aria-label="הסתרת מערך השיעור"
            >
              🔒
            </button>
          ) : (
            <button
              type="button"
              className="lesson-action-button hide-button"
              onClick={() => onShow(lesson._id)}
              title="הצגת מערך השיעור"
              aria-label="הצגת מערך השיעור"
            >
              🔓
            </button>
          )}

          <button
            type="button"
            className="lesson-action-button delete-button"
            onClick={() => onDelete(lesson._id)}
            title="מחיקת מערך השיעור"
            aria-label="מחיקת מערך השיעור"
          >
            🗑️
          </button>
        </div>
      )}
      {showManagementButtons && (
        <div className="lesson-access-management">
          <select
            value={selectedFacilitator}
            onChange={(e) => setSelectedFacilitator(e.target.value)}
          >
            <option value="">בחרי מנחה</option>
            {facilitators.map((facilitator) => (
              <option key={facilitator._id} value={facilitator._id}>
                {facilitator.fullName}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!selectedFacilitator || accessLoading}
            onClick={() => onOpenAccess(lesson._id, selectedFacilitator)}
          >
            פתיחת גישה
          </button>

          <button
            type="button"
            disabled={!selectedFacilitator || accessLoading}
            onClick={() => onCloseAccess(lesson._id, selectedFacilitator)}
          >
            סגירת גישה
          </button>
        </div>
      )}

      <span className="track-label">
        {lesson.track || 'ללא מסלול'}
      </span>

      <button
        type="button"
        className="lesson-title-link"
        onClick={openLessonDetails}
        aria-label={`פתיחת מערך השיעור ${lesson.title} בלשונית חדשה`}
      >
        <h2>{lesson.title}</h2>
      </button>

      <p className="lesson-description">
        {lesson.description || 'אין תיאור למערך זה.'}
      </p>

      <button
        type="button"
        className="open-lesson-button"
        onClick={openLessonDetails}
      >
        לפתיחת המערך המלא ←
      </button>
    </article>
  )
}

export default LessonCard
