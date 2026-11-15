import Comments from './Comments'
import PageShell from './ui/PageShell'
import { BookIcon, CalendarIcon, SunIcon, Spark } from './ui/Decor'
import './LessonDetails.css'

const FILES_BASE_URL = 'http://localhost:7001'

const TRACK_STYLES = {
  'ארוך': { className: 'track-long', label: 'מסלול ארוך', Icon: BookIcon },
  'קצר': { className: 'track-short', label: 'מסלול קצר', Icon: CalendarIcon },
  'קיץ': { className: 'track-summer', label: 'מסלול קיץ', Icon: SunIcon },
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  )
}

// שורת קובץ: לחיצה על השם פותחת תצוגה מקדימה, והחץ מוריד את הקובץ
function FileRow({ file, label, onPreview }) {
  return (
    <div className="ld-file">
      <span className="ld-file-icon"><FileIcon /></span>

      <button
        type="button"
        className="ld-file-name"
        onClick={() => onPreview?.(file)}
      >
        {label || file.name}
      </button>

      <a
        className="ld-file-download"
        href={`${FILES_BASE_URL}${file.url}`}
        download={file.name}
        title="הורדת הקובץ"
        aria-label={`הורדת ${file.name || 'הקובץ'}`}
      >
        <DownloadIcon />
      </a>
    </div>
  )
}

function LessonDetails({ lesson, onPreview, isCoordinator = false }) {
  const trackStyle = TRACK_STYLES[lesson.track] || {
    className: 'track-none',
    label: lesson.track || 'ללא מסלול',
    Icon: BookIcon,
  }
  const { Icon } = trackStyle

  const hasFiles = lesson.contentFile?.url || lesson.files?.length > 0

  return (
    <PageShell
      className={`ld ${trackStyle.className}`}
      eyebrow={
        <span className="ld-eyebrow">
          <Icon />
          {trackStyle.label}
        </span>
      }
      title={lesson.title}
      subtitle={lesson.description}
      onBack={() => window.close()}
      backLabel="סגירת הלשונית"
    >
      <div className={`ld-layout ${hasFiles ? '' : 'ld-layout-single'}`}>
        <article className="ld-main">
          {lesson.content ? (
            <section className="ld-section">
              <h2>תוכן השיעור</h2>
              <div className="ld-content">{lesson.content}</div>
            </section>
          ) : (
            <section className="ld-section">
              <h2>תוכן השיעור</h2>
              <p className="ld-muted">
                {hasFiles
                  ? 'תוכן השיעור נמצא בקבצים המצורפים.'
                  : 'עדיין לא נוסף תוכן למערך הזה.'}
              </p>
            </section>
          )}

          {lesson.notes && (
            <section className="ld-note">
              <Spark className="ld-note-spark" />
              <h2>הערות למנחה</h2>
              <p>{lesson.notes}</p>
            </section>
          )}
        </article>

        {hasFiles && (
          <aside className="ld-side">
            {lesson.contentFile?.url && (
              <section className="ld-files">
                <h2>קובץ תוכן השיעור</h2>
                <FileRow
                  file={lesson.contentFile}
                  label={lesson.contentFile.name || 'פתיחת קובץ התוכן'}
                  onPreview={onPreview}
                />
              </section>
            )}

            {lesson.files?.length > 0 && (
              <section className="ld-files">
                <h2>קבצים מצורפים</h2>
                {lesson.files.map((file) => (
                  <FileRow key={file._id || file.url} file={file} onPreview={onPreview} />
                ))}
              </section>
            )}
          </aside>
        )}
      </div>

      <section className="ld-comments">
        <Comments lessonId={lesson._id} showManagementButtons={isCoordinator} />
      </section>
    </PageShell>
  )
}

export default LessonDetails
