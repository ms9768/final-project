
import { useEffect, useState } from 'react'
import character from '../assets/character.png'
import './PendingApprovals.css'

const API_URL = 'http://localhost:7001/api/users'

const LEVELS = [
    { value: 'young', label: 'מנחה צעירה' },
    { value: 'senior', label: 'מנחה בוגרת' },
]

function PendingApprovals({ authToken }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [approvingId, setApprovingId] = useState(null)
    const [facilitatorLevels, setFacilitatorLevels] = useState({})

    async function loadPendingUsers() {
        try {
            setLoading(true)
            setError('')
            setMessage('')

            const response = await fetch(`${API_URL}/pending`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'טעינת הבקשות נכשלה')
            }

            setUsers(data)
        } catch (err) {
            setError(err.message || 'אירעה שגיאה בטעינת הבקשות')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPendingUsers()
    }, [])

    function handleLevelChange(userId, level) {
        setFacilitatorLevels((previous) => ({
            ...previous,
            [userId]: level,
        }))
    }

    async function approveUser(userId) {
        const facilitatorLevel = facilitatorLevels[userId]

        if (!facilitatorLevel) {
            setError('יש לבחור אם המנחה צעירה או בוגרת')
            return
        }

        try {
            setApprovingId(userId)
            setError('')
            setMessage('')

            const response = await fetch(`${API_URL}/${userId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    facilitatorLevel,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'אישור המנחה נכשל')
            }

            setUsers((previous) =>
                previous.filter((user) => user._id !== userId)
            )

            setMessage(data.message || 'המנחה אושרה בהצלחה!')

        } catch (err) {
            setError(err.message || 'אירעה שגיאה באישור המנחה')
        } finally {
            setApprovingId(null)
        }
    }

    return (
        <section className="pa">
            <div className="pa-toolbar">
                <p className="pa-count">
                    {loading
                        ? 'טוען בקשות...'
                        : users.length === 0
                            ? 'אין בקשות שממתינות'
                            : users.length === 1
                                ? 'בקשה אחת ממתינה לאישור'
                                : `${users.length} בקשות ממתינות לאישור`}
                </p>

                <button
                    type="button"
                    className="hp-btn hp-btn-outline hp-btn-sm"
                    onClick={loadPendingUsers}
                    disabled={loading || approvingId !== null}
                >
                    <svg className="pa-refresh" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />
                    </svg>
                    רענון בקשות
                </button>
            </div>

            {message && users.length > 0 && (
                <p className="hp-alert hp-alert-success" role="status">
                    <span aria-hidden="true">✓</span>
                    {message}
                </p>
            )}

            {error && (
                <p className="hp-alert hp-alert-error" role="alert">
                    <span aria-hidden="true">!</span>
                    {error}
                </p>
            )}

            {loading || (error && users.length === 0) ? null : users.length === 0 ? (
                <div className="pa-empty">
                    <img src={character} alt="" />
                    <p>{message || 'אין בקשות הרשמה שממתינות לאישור.'}</p>
                    {!message && <span>כל הבקשות טופלו</span>}
                </div>
            ) : (
                <div className="pa-list">
                    {users.map((user) => {
                        const selectedLevel = facilitatorLevels[user._id] || ''

                        return (
                            <article className="pa-card" key={user._id}>
                                <div className="pa-person">
                                    <span className="pa-avatar" aria-hidden="true">
                                        {user.fullName?.trim()?.[0] || '?'}
                                    </span>
                                    <div>
                                        <h3>{user.fullName}</h3>
                                        <p dir="ltr">{user.email}</p>
                                    </div>
                                </div>

                                <fieldset className="pa-levels" disabled={approvingId !== null}>
                                    <legend>סיווג המנחה</legend>

                                    {LEVELS.map((level) => (
                                        <label
                                            key={level.value}
                                            className={`pa-level ${selectedLevel === level.value ? 'is-selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`level-${user._id}`}
                                                value={level.value}
                                                checked={selectedLevel === level.value}
                                                onChange={() => handleLevelChange(user._id, level.value)}
                                            />
                                            {level.label}
                                        </label>
                                    ))}
                                </fieldset>

                                <button
                                    type="button"
                                    className="hp-btn hp-btn-purple hp-btn-sm pa-approve"
                                    onClick={() => approveUser(user._id)}
                                    disabled={approvingId !== null || !selectedLevel}
                                    title={!selectedLevel ? 'יש לבחור סיווג לפני האישור' : undefined}
                                >
                                    {approvingId === user._id ? 'מאשרת...' : 'אישור מנחה'}
                                    {approvingId !== user._id && <span aria-hidden="true">✓</span>}
                                </button>
                            </article>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default PendingApprovals
