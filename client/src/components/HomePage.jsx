
function HomePage({ onShowLessons, onShowContact }) {
    const tracks = [
        {
            title: 'המסלול הארוך',
            description: 'מאגר שיעורים וחומרי למידה לתהליך לימודי מתמשך.',
            icon: '📚',
            className: 'track-long',
        },
        {
            title: 'המסלול הקצר',
            description: 'חומרי למידה ממוקדים לפעילויות קצרות ומעשיות.',
            icon: '📝',
            className: 'track-short',
        },
        {
            title: 'מסלול הקיץ',
            description: 'רעיונות, פעילויות וחומרי הוראה לתקופת הקיץ.',
            icon: '☀️',
            className: 'track-summer',
        },
    ]

    const cities = [
        {
            name: 'ירושלים',
            description: 'פעילויות למידה, שיתוף ורעיונות חדשים.',
            image:
                'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'תל אביב',
            description: 'חומרי הוראה ורעיונות לפעילויות.',
            image:
                'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'באר שבע',
            description: 'למידה משותפת והעשרת הידע.',
            image:
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        },
    ]

    const testimonials = [
        {
            text: 'המערכת עוזרת לי למצוא חומרי הוראה ולארגן את השיעורים במקום אחד.',
            initial: 'מ',
            role: 'מורה בתוכנית',
        },
        {
            text: 'שיתוף הרעיונות והתגובות מאפשר לנו ללמוד מהניסיון של עמיתים.',
            initial: 'ר',
            role: 'רכזת התוכנית',
        },
        {
            text: 'קל יותר לאתר קבצים, לעיין בתכנים ולהיעזר בחומרים שכבר הוכנו.',
            initial: 'ת',
            role: 'משתתף בתוכנית',
        },
    ]

    function handleContactSubmit(event) {
        event.preventDefault()

        alert('ההודעה נקלטה בהדגמה. הטופס עדיין לא מחובר לשרת.')

        event.currentTarget.reset()
    }

    return (
        <section className="home-page" dir="rtl">
            {/* אזור פתיחה */}
            <div className="home-hero">
                <div className="home-hero-content">
                    <span className="home-eyebrow">מאגר ידע ולמידה</span>

                    <h1>כל חומרי הלמידה במקום אחד</h1>

                    <p>
                        ברוכים הבאים למערכת ניהול התוכנית.
                        כאן תוכלו למצוא שיעורים, חומרי הוראה,
                        קבצים מצורפים ורעיונות לשיתוף ידע.
                    </p>

                    <button
                        type="button"
                        className="home-primary-button"
                        onClick={onShowLessons}
                    >
                        מעבר למאגר השיעורים
                        <span aria-hidden="true"> ←</span>
                    </button>
                </div>

                <div className="home-hero-decoration" aria-hidden="true">
                    <div className="home-book-icon">📖</div>
                    <div className="home-decoration-card">
                        <span>✓</span>
                        חומרי למידה מסודרים
                    </div>
                </div>
            </div>

            {/* המסלולים */}
            <section className="home-tracks">
                <div className="home-section-heading">
                    <span className="home-eyebrow">התוכנית שלנו</span>
                    <h2>בוחרים מסלול ומתחילים ללמוד</h2>
                    <p>
                        בכל מסלול תוכלו למצוא חומרי למידה
                        המתאימים לפעילויות התוכנית.
                    </p>
                </div>

                <div className="home-tracks-grid">
                    {tracks.map((track) => (
                        <article
                            className={`home-track-card ${track.className}`}
                            key={track.title}
                        >
                            <div className="home-track-icon" aria-hidden="true">
                                {track.icon}
                            </div>

                            <h3>{track.title}</h3>
                            <p>{track.description}</p>

                            <button
                                type="button"
                                className="home-track-button"
                                onClick={onShowLessons}
                            >
                                לצפייה בשיעורים
                                <span aria-hidden="true"> ←</span>
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            {/* הערים */}
            <section className="home-cities">
                <div className="home-section-heading">
                    <span className="home-eyebrow">התוכנית ברחבי הארץ</span>
                    <h2>לומדים ויוצרים יחד</h2>
                    <p>
                        הצצה לפעילות התוכנית בערים שונות.
                        התוכן והתמונות כאן הם להמחשה בלבד.
                    </p>
                </div>

                <div className="home-cities-grid">
                    {cities.map((city) => (
                        <article className="home-city-card" key={city.name}>
                            <img src={city.image} alt={`תמונה להמחשה של ${city.name}`} />

                            <div className="home-city-content">
                                <h3>{city.name}</h3>
                                <p>{city.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* עדויות */}
            <section className="home-testimonials">
                <div className="home-section-heading">
                    <span className="home-eyebrow">משתפים מהניסיון</span>
                    <h2>מה מספרים המשתתפים?</h2>
                    <p>דוגמאות להתרשמויות שאפשר יהיה להציג באתר.</p>
                </div>

                <div className="home-testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <article className="home-testimonial-card" key={index}>
                            <div className="home-quote-mark" aria-hidden="true">
                                “
                            </div>

                            <p>{testimonial.text}</p>

                            <div className="home-testimonial-author">
                                <div
                                    className="home-testimonial-avatar"
                                    aria-hidden="true"
                                >
                                    {testimonial.initial}
                                </div>

                                <div>
                                    <h3>{testimonial.role}</h3>
                                    <span>עדות לדוגמה</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <p className="home-testimonials-note">
                    הטקסטים והשמות המוצגים כאן הם להמחשה בלבד.
                </p>
            </section>

            {/* שיתוף ידע */}
            <section className="home-info">
                <div>
                    <span className="home-eyebrow">לומדים ומשתפים</span>
                    <h2>ידע שנבנה יחד</h2>
                    <p>
                        עיינו בשיעורים, פתחו חומרי הוראה,
                        והיעזרו בתגובות וברעיונות שמשתפים
                        המשתמשים במערכת.
                    </p>
                </div>

                <button
                    type="button"
                    className="home-secondary-button"
                    onClick={onShowLessons}
                >
                    כניסה למאגר
                </button>

                <button
                    type="button"
                    className="home-secondary-button"
                    onClick={onShowContact}
                >
                    יצירת קשר
                </button>
            </section>

            
        </section>
    )
}

export default HomePage
