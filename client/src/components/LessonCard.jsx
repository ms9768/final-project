
function LessonCard({
  lesson,
  onHide,
  onShow,
  onDelete,
  onEdit,
  showManagementButtons,
}) {
  function openLessonDetails() {
    const url = `${window.location.origin}${window.location.pathname}?lessonId=${encodeURIComponent(lesson._id)}`
    window.open(url, '_blank', 'noopener,noreferrer')
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
              👁️
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
