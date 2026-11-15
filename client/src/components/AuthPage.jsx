import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../services/apiConfig'
import logo from '../assets/logo.png'
import character from '../assets/character.png'
import { Spark, ArrowIcon, Leaf } from './ui/Decor'
import './AuthPage.css'

const API_URL = `${API_BASE_URL}/api/users`

function EyeIcon({ open }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {!open && <path d="M4 4l16 16" />}
        </svg>
    )
}

function AuthPage({ onLogin, onBack }) {
    const [isRegister, setIsRegister] = useState(false)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [coordinatorCode, setCoordinatorCode] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    function switchMode(register) {
        setIsRegister(register)
        setError('')
        setMessage('')
    }

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
        <main className="hp ap" dir="rtl">
            {/* ---------- צד סגול עם הדמות ---------- */}
            <section className="ap-welcome">
                <img src={logo} alt="מבט לגובה" className="ap-logo" />

                <div className="ap-welcome-text">
                    <h1>
                        {isRegister ? 'מצטרפות אלינו?' : 'שמחות לראות אותך!'}
                        <Spark className="ap-welcome-spark" />
                    </h1>
                    <p>
                        {isRegister
                            ? 'נרשמים עם קוד הרכזת, ואחרי אישור אפשר להתחיל לעבוד עם המאגר.'
                            : 'נכנסים למערכת כדי לגשת למאגר השיעורים, לדיווחים ולכל הכלים.'}
                    </p>
                </div>

                <img src={character} alt="" className="ap-character" />

                <svg className="ap-drops" viewBox="0 0 60 60" aria-hidden="true">
                    <path d="M20 8c6 10 8 20 2 26-6-2-8-12-2-26z" />
                    <path d="M42 18c3 8 3 15-2 19-4-3-4-10 2-19z" />
                </svg>

                {/* גל בצד - מפריד בין החלק הסגול לטופס */}
                <svg className="ap-side-wave" viewBox="0 0 80 800" preserveAspectRatio="none" aria-hidden="true">
                    <path className="ap-side-wave-back" d="M80 0H40C10 120 60 230 30 360s30 260 10 440h40z" />
                    <path d="M80 0H58C30 140 76 250 46 380s26 250 14 420h20z" />
                </svg>
            </section>

            {/* ---------- הטופס ---------- */}
            <section className="ap-form-side">
                {onBack && (
                    <button type="button" className="ps-back ap-back" onClick={onBack}>
                        חזרה לדף הבית
                        <ArrowIcon />
                    </button>
                )}

                <Leaf />

                <div className="ap-card">
                    <div className="ap-tabs" role="tablist" aria-label="סוג כניסה">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={!isRegister}
                            className={!isRegister ? 'is-active' : ''}
                            onClick={() => switchMode(false)}
                        >
                            התחברות
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={isRegister}
                            className={isRegister ? 'is-active' : ''}
                            onClick={() => switchMode(true)}
                        >
                            הרשמת מנחה
                        </button>
                        <span className={`ap-tabs-pill ${isRegister ? 'is-second' : ''}`} aria-hidden="true" />
                    </div>

                    <h2>{isRegister ? 'הרשמת מנחה' : 'התחברות למערכת'}</h2>

                    <form className="ap-form" onSubmit={handleSubmit}>
                        {isRegister && (
                            <>
                                <label className="ap-field">
                                    <span>שם מלא</span>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        autoComplete="name"
                                        required
                                    />
                                </label>

                                <label className="ap-field">
                                    <span>קוד רכזת</span>
                                    <input
                                        type="text"
                                        value={coordinatorCode}
                                        onChange={(event) => setCoordinatorCode(event.target.value)}
                                        required
                                    />
                                </label>
                            </>
                        )}

                        <label className="ap-field">
                            <span>כתובת מייל</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                dir="ltr"
                                required
                            />
                        </label>

                        <label className="ap-field">
                            <span>סיסמה</span>
                            <div className="ap-password">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                    dir="ltr"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    className="ap-eye"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'הסתרת הסיסמה' : 'הצגת הסיסמה'}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {isRegister && <small>לפחות 8 תווים</small>}
                        </label>

                        {error && (
                            <p className="hp-alert hp-alert-error" role="alert">
                                <span aria-hidden="true">!</span>
                                {error}
                            </p>
                        )}
                        {message && (
                            <p className="hp-alert hp-alert-success" role="status">
                                <span aria-hidden="true">✓</span>
                                {message}
                            </p>
                        )}

                        <button type="submit" className="hp-btn hp-btn-purple ap-submit" disabled={loading}>
                            {loading
                                ? 'נא להמתין...'
                                : isRegister
                                    ? 'שליחת בקשת הרשמה'
                                    : 'התחברות'}
                            {!loading && <ArrowIcon />}
                        </button>
                    </form>

                    <button
                        type="button"
                        className="ap-switch"
                        onClick={() => switchMode(!isRegister)}
                    >
                        {isRegister
                            ? 'כבר רשומה? מעבר להתחברות'
                            : 'עדיין אין לך חשבון? הרשמת מנחה'}
                    </button>
                </div>
            </section>
        </main>
    )
}

export default AuthPage
