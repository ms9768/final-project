import Comments from './Comments'

function LessonCard({
    lesson,
    onPreview,
    onHide,
    onShow,
    onDelete,
    onEdit,
    showManagementButtons
}) {
    return (
        <article className="lesson-card">
            <span className="track-label">{lesson.track}</span>

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
                            🔓
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="lesson-action-button hide-button"
                            onClick={() => onShow(lesson._id)}
                            title="הצגת מערך השיעור"
                            aria-label="הצגת מערך השיעור"
                        >
                            🔒
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

            <h2>{lesson.title}</h2>

            <p className="lesson-description">
                {lesson.description}
            </p>

            {lesson.notes && (
                <p className="lesson-notes">
                    <strong>הערות למנחה:</strong> {lesson.notes}
                </p>
            )}

            {lesson.files?.length > 0 && (
                <div className="files-section">
                    <h3>קבצים מצורפים</h3>

                    {lesson.files.map((file) => (
                        <div
                            className="file-item"
                            key={file._id || file.url}
                        >
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
                                aria-label={`הורדת ${file.name}`}
                                title="הורדת הקובץ"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <path d="m7 10 5 5 5-5" />
                                    <path d="M12 15V3" />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {(lesson.content || lesson.contentFile?.url) && (
                <details className="lesson-content">
                    <summary>הצגת תוכן השיעור</summary>

                    {lesson.content && (
                        <p>{lesson.content}</p>
                    )}

                    {lesson.contentFile?.url && (
                        <p>
                            <button
                                type="button"
                                onClick={() => onPreview(lesson.contentFile)}
                            >
                                📄 {lesson.contentFile.name}
                            </button>
                        </p>
                    )}
                </details>
            )}
            <Comments lessonId={lesson._id} />
        </article>
    )
}

export default LessonCard
