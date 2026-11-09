
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:7001/api/users'

function PendingApprovals({ authToken }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [approvingId, setApprovingId] = useState(null)

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

    async function approveUser(userId) {
        try {
            setApprovingId(userId)
            setError('')
            setMessage('')

            const response = await fetch(`${API_URL}/${userId}/approve`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'אישור המנחה נכשל')
            }

            setUsers((previous) =>
                previous.filter((user) => user._id !== userId)
            )

            setMessage(data.message || 'המשתמשת אושרה בהצלחה!')
        } catch (err) {
            setError(err.message || 'אירעה שגיאה באישור המנחה')
        } finally {
            setApprovingId(null)
        }
    }

    return (
        <section className="pending-approvals">
            <h2>בקשות הרשמה לאישור</h2>

            {loading ? (
                <p className="status-message">טוען בקשות...</p>
            ) : error ? (
                <p className="status-message error">{error}</p>
            ) : users.length === 0 ? (
                <p className="status-message">
                    {message || 'אין בקשות הרשמה שממתינות לאישור.'}
                </p>
            ) : (
                <div className="pending-users-list">
                    {users.map((user) => (
                        <div className="pending-user-card" key={user._id}>
                            <div>
                                <h3>{user.fullName}</h3>
                                <p>{user.email}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => approveUser(user._id)}
                                disabled={approvingId !== null}
                            >
                                {approvingId === user._id
                                    ? 'מאשרת...'
                                    : 'אישור מנחה'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={loadPendingUsers}
                disabled={loading}
            >
                רענון בקשות
            </button>
        </section>
    )
}

export default PendingApprovals
