
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:7001/api/contacts'

function ContactManagement({ authToken }) {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadContacts() {
            setLoading(true)
            setError('')

            try {
                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'טעינת הפניות נכשלה')
                }

                setContacts(data)
            } catch (err) {
                setError(err.message || 'לא ניתן להתחבר לשרת')
            } finally {
                setLoading(false)
            }
        }

        loadContacts()
    }, [authToken])

    function formatDate(date) {
        if (!date) return 'לא צוין'

        return new Date(date).toLocaleString('he-IL')
    }

    return (
        <section className="contact-management" dir="rtl">
            <h2>פניות שהתקבלו</h2>
            <p>כאן ניתן לראות את הפניות שנשלחו דרך האתר.</p>

            {loading && <p>טוענת פניות...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && contacts.length === 0 && (
                <p>עדיין לא התקבלו פניות.</p>
            )}

            {!loading && !error && contacts.length > 0 && (
                <>
                    <p>מספר הפניות שהתקבלו: {contacts.length}</p>

                    <div className="contact-list">
                        {contacts.map((contact) => (
                            <article
                                className="contact-card"
                                key={contact._id}
                            >
                                <h3>
                                    {contact.contactType === 'municipality'
                                        ? '🏢 פנייה מעירייה או רשות מקומית'
                                        : '👤 פנייה מאדם פרטי'}
                                </h3>

                                {contact.municipalityName && (
                                    <p>
                                        <strong>שם הרשות:</strong>{' '}
                                        {contact.municipalityName}
                                    </p>
                                )}

                                {contact.city && (
                                    <p>
                                        <strong>עיר:</strong> {contact.city}
                                    </p>
                                )}

                                <p>
                                    <strong>שם הפונה:</strong> {contact.name}
                                </p>

                                <p>
                                    <strong>דוא״ל:</strong>{' '}
                                    <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {contact.email}
                                    </a>
                                </p>

                                {contact.phone && (
                                    <p>
                                        <strong>טלפון:</strong>{' '}
                                        <span>{contact.phone}</span>
                                    </p>
                                )}

                                <p>
                                    <strong>תאריך הפנייה:</strong>{' '}
                                    {formatDate(contact.createdAt)}
                                </p>

                                <p>
                                    <strong>סטטוס:</strong>{' '}
                                    {contact.status === 'handled'
                                        ? 'טופלה'
                                        : contact.status === 'read'
                                            ? 'נקראה'
                                            : 'חדשה'}
                                </p>

                                <div className="contact-message">
                                    <strong>תוכן ההודעה:</strong>
                                    <p>{contact.message}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export default ContactManagement
