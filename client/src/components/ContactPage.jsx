
import { useState } from 'react'

const API_URL = 'http://localhost:7001/api/contacts'

function ContactPage() {
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
    <section className="contact-page" dir="rtl">
      <div className="home-section-heading">
        <span className="home-eyebrow">אנחנו כאן בשבילכם</span>
        <h1>יצירת קשר</h1>
        <p>יש שאלה או הצעה? נשמח לשמוע מכם.</p>
      </div>

      <form className="home-contact-form" onSubmit={handleSubmit}>
        <label htmlFor="contact-type">מי פונה אלינו?</label>
        <select
          id="contact-type"
          name="contactType"
          value={contactType}
          onChange={(event) => setContactType(event.target.value)}
          required
        >
          <option value="private">אדם פרטי</option>
          <option value="municipality">עירייה או רשות מקומית</option>
        </select>

        {contactType === 'municipality' && (
          <>
            <label htmlFor="municipality-name">שם העירייה או הרשות</label>
            <input
              id="municipality-name"
              name="municipalityName"
              type="text"
              placeholder="הקלידו את שם הרשות"
              required
            />

            <label htmlFor="contact-city">עיר</label>
            <input
              id="contact-city"
              name="city"
              type="text"
              placeholder="הקלידו את שם העיר"
              required
            />
          </>
        )}

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

        <label htmlFor="contact-email">כתובת דוא״ל</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />

        <label htmlFor="contact-phone">מספר טלפון</label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          placeholder="הקלידו מספר טלפון"
        />

        <label htmlFor="contact-message">ההודעה שלכם</label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          placeholder="כתבו כאן את ההודעה..."
          required
        />

        {statusMessage && <p role="status">{statusMessage}</p>}
        {errorMessage && <p role="alert">{errorMessage}</p>}

        <button
          type="submit"
          className="home-primary-button"
          disabled={loading}
        >
          {loading ? 'שולחת...' : 'שליחת הודעה'}
        </button>
      </form>
    </section>
  )
}

export default ContactPage
