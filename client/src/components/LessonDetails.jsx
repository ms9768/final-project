
import Comments from './Comments'

function LessonDetails({ lesson, onPreview, isCoordinator = false }) {
  return (
    <section className="lesson-details-page" dir="rtl">
      <button
        type="button"
        className="back-home-button"
        onClick={() => window.close()}
      >
        סגירת הלשונית
      </button>

      <article className="lesson-details-card">
        <span className="track-label">
          {lesson.track || 'ללא מסלול'}
        </span>

        <h1>{lesson.title}</h1>

        {lesson.description && (
          <section className="lesson-detail-section">
            <h2>תיאור המערך</h2>
            <p>{lesson.description}</p>
          </section>
        )}

        {lesson.content && (
          <section className="lesson-detail-section">
            <h2>תוכן השיעור</h2>
            <div className="lesson-full-content">
              {lesson.content}
            </div>
          </section>
        )}

        {lesson.notes && (
          <section className="lesson-detail-section">
            <h2>הערות למנחה</h2>
            <p>{lesson.notes}</p>
          </section>
        )}

        {lesson.contentFile?.url && (
          <section className="lesson-detail-section">
            <h2>קובץ תוכן השיעור</h2>

            <div className="file-item">
              <button
                type="button"
                className="file-name-button"
                onClick={() => onPreview(lesson.contentFile)}
              >
                {lesson.contentFile.name || 'פתיחת קובץ התוכן'}
              </button>

              <a
                className="download-link"
                href={`http://localhost:7001${lesson.contentFile.url}`}
                download={lesson.contentFile.name}
                title="הורדת הקובץ"
                aria-label="הורדת קובץ תוכן השיעור"
              >
                ↓
              </a>
            </div>
          </section>
        )}

        {lesson.files?.length > 0 && (
          <section className="lesson-detail-section files-section">
            <h2>קבצים מצורפים</h2>

            {lesson.files.map((file) => (
              <div className="file-item" key={file._id || file.url}>
                <button
                  type="button"
                  className="file-name-button"
                  onClick={() => onPreview(file)}
                >
                  {file.name}
                </button>

                <a
                  className="download-link"
                  href={`http://localhost:7001${file.url}`}
                  download={file.name}
                  title="הורדת הקובץ"
                  aria-label={`הורדת ${file.name}`}
                >
                  ↓
                </a>
              </div>
            ))}
          </section>
        )}

        <section className="lesson-detail-section">
          <Comments
            lessonId={lesson._id}
            showManagementButtons={isCoordinator}
          />        </section>
      </article>
    </section>
  )
}

export default LessonDetails
