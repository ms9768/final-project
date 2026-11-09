
import { useState } from 'react'

const API_URL = 'http://localhost:7001/api/users'

function AuthPage({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [coordinatorCode, setCoordinatorCode] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setMessage('')
        setError('')
        setLoading(true)

        try {
            const endpoint = isRegister ? '/register' : '/login'

            const body = isRegister
                ? { fullName, email, password, coordinatorCode }
                : { email, password }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'הפעולה נכשלה')
            }

            if (isRegister) {
                setMessage(data.message)
                setIsRegister(false)
                setPassword('')
            } else {
                sessionStorage.setItem('authToken', data.token)
                sessionStorage.setItem('currentUser', JSON.stringify(data.user))
                onLogin(data.user)
            }
        } catch (err) {
            setError(err.message || 'אירעה שגיאה')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="page auth-page" dir="rtl">
            <section className="auth-card">
                <h1>{isRegister ? 'הרשמת מנחה' : 'התחברות למערכת'}</h1>

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <label>
                                שם מלא
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    required
                                />
                            </label>

                            <label>
                                קוד רכזת
                                <input
                                    type="text"
                                    value={coordinatorCode}
                                    onChange={(event) => setCoordinatorCode(event.target.value)}
                                    required
                                />
                            </label>
                        </>
                    )}

                    <label>
                        כתובת מייל
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        סיסמה
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={8}
                            required
                        />
                    </label>

                    {error && <p className="status-message error">{error}</p>}
                    {message && <p className="status-message">{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading
                            ? 'נא להמתין...'
                            : isRegister
                                ? 'שליחת בקשת הרשמה'
                                : 'התחברות'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => {
                        setIsRegister(!isRegister)
                        setError('')
                        setMessage('')
                    }}
                >
                    {isRegister
                        ? 'כבר רשומה? מעבר להתחברות'
                        : 'עדיין אין לך חשבון? הרשמת מנחה'}
                </button>
            </section>
        </main>
    )
}

export default AuthPage
