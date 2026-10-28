
function ContactPage() {
  function handleSubmit(event) {
    event.preventDefault()

    alert('ההודעה נקלטה בהדגמה. הטופס עדיין לא מחובר לשרת.')

    event.currentTarget.reset()
  }

  return (
    <section className="contact-page" dir="rtl">
      <div className="home-section-heading">
        <span className="home-eyebrow">אנחנו כאן בשבילכם</span>
        <h1>יצירת קשר</h1>
        <p>יש שאלה או הצעה? נשמח לשמוע מכם.</p>
      </div>

      <form className="home-contact-form" onSubmit={handleSubmit}>
        <label htmlFor="contact-name">שם מלא</label>
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

        <label htmlFor="contact-message">ההודעה שלכם</label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          placeholder="כתבו כאן את ההודעה..."
          required
        />

        <button type="submit" className="home-primary-button">
          שליחת הודעה
        </button>
      </form>
    </section>
  )
}

export default ContactPage
