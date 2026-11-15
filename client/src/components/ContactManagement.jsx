
import { useEffect, useState } from 'react'
import { DashboardIcons, UserIcon } from './ui/Decor'
import './AdminPages.css'

const API_URL = 'http://localhost:7001/api/contacts'

function ContactManagement({ authToken }) {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

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

    const statusLabels = {
        new: 'חדשה',
        read: 'נקראה',
        handled: 'טופלה',
    }

    function getStatus(contact) {
        return contact.status === 'handled' || contact.status === 'read'
            ? contact.status
            : 'new'
    }

    const filters = [
        { value: 'all', label: 'הכל' },
        { value: 'new', label: 'חדשות' },
        { value: 'read', label: 'נקראו' },
        { value: 'handled', label: 'טופלו' },
    ]

    const visibleContacts =
        statusFilter === 'all'
            ? contacts
            : contacts.filter((contact) => getStatus(contact) === statusFilter)

    function countFor(value) {
        return value === 'all'
            ? contacts.length
            : contacts.filter((contact) => getStatus(contact) === value).length
    }

    return (
        <div className="adm cm">
            {loading && <p className="adm-state">טוענת פניות...</p>}

            {error && (
                <p className="hp-alert hp-alert-error" role="alert">
                    <span aria-hidden="true">!</span>
                    {error}
                </p>
            )}

            {!loading && !error && contacts.length === 0 && (
                <p className="adm-state">עדיין לא התקבלו פניות.</p>
            )}

            {!loading && !error && contacts.length > 0 && (
                <>
                    <div className="adm-toolbar">
                        <p className="adm-toolbar-title">
                            {contacts.length === 1 ? 'התקבלה פנייה אחת' : `התקבלו ${contacts.length} פניות`}
                        </p>

                        <div className="adm-chips" role="group" aria-label="סינון לפי סטטוס">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    className={`adm-chip ${statusFilter === filter.value ? 'is-active' : ''}`}
                                    aria-pressed={statusFilter === filter.value}
                                    onClick={() => setStatusFilter(filter.value)}
                                >
                                    {filter.label}
                                    <span>{countFor(filter.value)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {visibleContacts.length === 0 ? (
                        <p className="adm-state">אין פניות בסטטוס הזה.</p>
                    ) : (
                        <div className="cm-list">
                            {visibleContacts.map((contact) => {
                                const isMunicipality = contact.contactType === 'municipality'
                                const status = getStatus(contact)

                                return (
                                    <article
                                        className={`cm-card cm-status-${status}`}
                                        key={contact._id}
                                    >
                                        <header className="cm-card-head">
                                            <span className={`cm-type-icon ${isMunicipality ? 'is-municipality' : ''}`}>
                                                {isMunicipality ? <BuildingIcon /> : <UserIcon />}
                                            </span>

                                            <div className="cm-who">
                                                <h3>{contact.name}</h3>
                                                <span>
                                                    {isMunicipality
                                                        ? [contact.municipalityName, contact.city].filter(Boolean).join(' · ') || 'עירייה או רשות מקומית'
                                                        : 'אדם פרטי'}
                                                </span>
                                            </div>

                                            <span className={`adm-tag cm-tag-${status}`}>
                                                {statusLabels[status]}
                                            </span>
                                        </header>

                                        <p className="cm-message">{contact.message}</p>

                                        <footer className="cm-card-foot">
                                            <span className="cm-date">{formatDate(contact.createdAt)}</span>

                                            <div className="cm-actions">
                                                {contact.phone && (
                                                    <a className="cm-action" href={`tel:${contact.phone}`} dir="ltr">
                                                        {contact.phone}
                                                    </a>
                                                )}

                                                <a
                                                    className="cm-action cm-action-mail"
                                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={contact.email}
                                                >
                                                    {DashboardIcons.contacts()}
                                                    מענה במייל
                                                </a>
                                            </div>
                                        </footer>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function BuildingIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 21V5l8-3v19M12 8h8v13M2 21h20" />
            <path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2" />
        </svg>
    )
}

export default ContactManagement
