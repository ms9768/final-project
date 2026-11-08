
function PreviewModal({
  previewFile,
  previewHtml,
  previewPdfUrl,
  previewLoading,
  previewError,
  onClose,
}) {
  if (!previewFile) {
    return null
  }

  return (
    <div
      className="preview-backdrop"
      onClick={onClose}
    >
      <section
        className="preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="preview-header">
          <h2 id="preview-title">{previewFile.name}</h2>

          <button
            type="button"
            className="preview-close"
            onClick={onClose}
            aria-label="סגירת התצוגה המקדימה"
          >
            ✕
          </button>
        </header>

        <div className="preview-toolbar">
          <a
            className="preview-download"
            href={`http://localhost:7001${previewFile.url}`}
            download={previewFile.name}
          >
            <span aria-hidden="true">↓</span>
            הורדת הקובץ
          </a>
        </div>

        <div className="preview-body">
          {previewLoading && (
            <p className="status-message">
              מכין תצוגה מקדימה...
            </p>
          )}

          {previewError && (
            <p className="status-message error">
              {previewError}
            </p>
          )}

          {!previewLoading &&
            !previewError &&
            previewPdfUrl && (
              <iframe
                className="preview-pdf"
                src={previewPdfUrl}
                title={`תצוגה מקדימה: ${previewFile.name}`}
                width="100%"
                height="600"
              />
            )}

          {!previewLoading &&
            !previewError &&
            previewHtml && (
              <article
                className="document-content"
                dangerouslySetInnerHTML={{
                  __html: previewHtml,
                }}
              />
            )}
        </div>
      </section>
    </div>
  )
}

export default PreviewModal
