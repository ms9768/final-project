import { useState } from 'react'
import character from '../assets/character.png'
import PageShell from './ui/PageShell'
import { Spark, ArrowIcon, Envelope, UserIcon } from './ui/Decor'
import './ContactPage.css'

const API_URL = 'http://localhost:7001/api/contacts'

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5l8-3v19M12 8h8v13M2 21h20" />
      <path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2" />
    </svg>
  )
}

const contactTypes = [
  { value: 'private', label: 'אדם פרטי', Icon: UserIcon },
  { value: 'municipality', label: 'עירייה או רשות מקומית', Icon: BuildingIcon },
]

const steps = [
  { number: '1', text: 'ממלאים את הטופס' },
  { number: '2', text: 'הפנייה מגיעה אלינו' },
  { number: '3', text: 'חוזרים אליכם בהקדם' },
]

function ContactPage({ onBack }) {
  const [contactType, setContactType] = useState('private')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setStatusMessage('')
    setErrorMessage('')
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    const contactData = {
      contactType,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      municipalityName: formData.get('municipalityName'),
      city: formData.get('city'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'שליחת הפנייה נכשלה')
      }

      setStatusMessage('הפנייה נשלחה בהצלחה! תודה שיצרתם קשר.')
      form.reset()
      setContactType('private')
    } catch (error) {
      setErrorMessage(
        error.message || 'לא ניתן להתחבר לשרת. נסו שוב מאוחר יותר.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      className="cp"
      eyebrow="אנחנו כאן בשבילכם"
      title="יצירת קשר"
      subtitle="יש שאלה או הצעה? נשמח לשמוע מכם."
      onBack={onBack}
      art={<img src={character} alt="" className="cp-character" />}
    >
      <div className="cp-layout">
        {/* ---------- הטופס ---------- */}
        <div className="cp-card">
          <div className="cp-card-heading">
            <h2>נשמח לשמוע מכם!</h2>
            <p>מלאו את הפרטים ונחזור אליכם בהקדם.</p>
          </div>

          <form className="cp-form" onSubmit={handleSubmit}>
            <fieldset className="cp-types">
              <legend>מי פונה אלינו?</legend>

              {contactTypes.map(({ value, label, Icon }) => (
                <label
                  key={value}
                  className={`cp-type ${contactType === value ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="contactType"
                    value={value}
                    checked={contactType === value}
                    onChange={(event) => setContactType(event.target.value)}
                  />
                  <span className="cp-type-icon"><Icon /></span>
                  {label}
                </label>
              ))}
            </fieldset>

            <div className="cp-grid">
              {contactType === 'municipality' && (
                <>
                  <div className="cp-field">
                    <label htmlFor="municipality-name">שם העירייה או הרשות</label>
                    <input
                      id="municipality-name"
                      name="municipalityName"
                      type="text"
                      placeholder="הקלידו את שם הרשות"
                      required
                    />
                  </div>

                  <div className="cp-field">
                    <label htmlFor="contact-city">עיר</label>
                    <input
                      id="contact-city"
                      name="city"
                      type="text"
                      placeholder="הקלידו את שם העיר"
                      required
                    />
                  </div>
                </>
              )}

              <div className="cp-field cp-field-wide">
                <label htmlFor="contact-name">
                  {contactType === 'municipality' ? 'שם איש או אשת הקשר' : 'שם מלא'}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="הקלידו את שמכם"
                  required
                />
              </div>

              <div className="cp-field">
                <label htmlFor="contact-email">כתובת דוא״ל</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  dir="ltr"
                  required
                />
              </div>

              <div className="cp-field">
                <label htmlFor="contact-phone">
                  מספר טלפון <span className="cp-optional">(לא חובה)</span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="הקלידו מספר טלפון"
                />
              </div>

              <div className="cp-field cp-field-wide">
                <label htmlFor="contact-message">ההודעה שלכם</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  placeholder="כתבו כאן את ההודעה..."
                  required
                />
              </div>
            </div>

            {statusMessage && (
              <p className="hp-alert hp-alert-success" role="status">
                <span aria-hidden="true">✓</span>
                {statusMessage}
              </p>
            )}

            {errorMessage && (
              <p className="hp-alert hp-alert-error" role="alert">
                <span aria-hidden="true">!</span>
                {errorMessage}
              </p>
            )}

            <button type="submit" className="hp-btn hp-btn-purple cp-submit" disabled={loading}>
              {loading ? 'שולחת...' : 'שליחת הודעה'}
              {!loading && <ArrowIcon />}
            </button>
          </form>
        </div>

        {/* ---------- כרטיס צד ---------- */}
        <aside className="cp-side">
          <Spark className="cp-side-spark" />
          <h2>איך זה עובד?</h2>

          <ol className="cp-steps">
            {steps.map((step) => (
              <li key={step.number}>
                <span className="cp-step-number">{step.number}</span>
                {step.text}
              </li>
            ))}
          </ol>

          <div className="cp-side-art">
            <Envelope />
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

export default ContactPage
