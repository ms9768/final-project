
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:7001/api/lessons'

function App() {
  const [lessons, setLessons] = useState([])
  const [search, setSearch] = useState('')
  const [track, setTrack] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          throw new Error('לא הצלחנו לטעון את מערכי השיעור')
        }

        const data = await response.json()
        setLessons(data)
      } catch (err) {
        setError(
          'לא ניתן לטעון את מערכי השיעור. בדקי ששרת ה־API פועל.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [search, track])

  return (
    <main className="page" dir="rtl">
      <header className="page-header">
        <div>
          <p className="eyebrow">מאגר ידע ולמידה</p>
          <h1>מערכי שיעור</h1>
          <p className="subtitle">
            כל חומרי הלמידה במקום אחד
          </p>
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
              <article className="lesson-card" key={lesson._id}>
                <span className="track-label">{lesson.track}</span>

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
                      <a
                        key={file._id || file.url}
                        className="file-link"
                        href={`http://localhost:7001${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.name}
                      </a>
                    ))}
                  </div>
                )}

                <details className="lesson-content">
                  <summary>הצגת תוכן השיעור</summary>
                  <p>{lesson.content}</p>
                </details>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  )
}

export default App
