import logo from '../assets/logo.png'
import character from '../assets/character.png'

import jerusalem from '../assets/cities/jerusalem.jpg'
import beitShemesh from '../assets/cities/beit-shemesh.jpg'
import modiin from '../assets/cities/rechovot.jpg'
import bneiBrak from '../assets/cities/bnei-brak.jpg'

import { useRef, useEffect, useState } from 'react'

function HomePage({ onShowLessons, onShowContact, onShowLogin }) {
    const citiesTrackRef = useRef(null)
    const locationIconRef = useRef(null)
    const [locationIconVisible, setLocationIconVisible] = useState(false)

    useEffect(() => {
        const element = locationIconRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => setLocationIconVisible(entry.isIntersecting),
            { threshold: 0.3 }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [])

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
            image: jerusalem,
        },
        {
            name: 'בית שמש',
            description: 'למידה, שיתוף ורעיונות חדשים בבית שמש.',
            image: beitShemesh,
        },
        {
            name: 'מודיעין',
            description: 'פעילות חינוכית ויצירה משותפת במודיעין.',
            image: modiin,
        },
        {
            name: 'בני ברק',
            description: 'למידה משותפת והעשרת הידע בבני ברק.',
            image: bneiBrak,
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

    return (
        <section className="home-page" dir="rtl">

            <header className="site-header">
                <a href="#home" className="site-logo-link">
                    <img src={logo} alt="לוגו התוכנית" className="site-logo" />
                </a>

                <nav className="site-navigation">
                    <a href="#home">דף הבית</a>
                    <a href="#about">אודות התוכנית</a>
                    <a href="#tracks">מסלולים</a>
                    <a href="#cities">היכן אנחנו פועלות?</a>
                    <a href="#testimonials">המלצות</a>
                    <a href="#contact">יצירת קשר</a>
                </nav>

                <button
                    type="button"
                    className="header-login-button"
                    onClick={onShowLogin}
                >
                    כניסה למערכת
                    <span>♙</span>
                </button>
            </header>

            <section className="home-hero" id="home">
                <div className="home-hero-content">
                    <h1>
                        מערך תוכן
                        <span className="hero-title-underline"></span>
                    </h1>

                    <p>
                        מאגר מערכים, כלים ורעיונות
                        <br />
                        להובלת קבוצות משמעותיות
                    </p>

                    <button
                        type="button"
                        className="home-primary-button"
                        onClick={onShowLessons}
                    >
                        מעבר למאגר השיעורים
                        <span>←</span>
                    </button>
                </div>

                <div className="home-hero-decoration">
                    <img
                        src={character}
                        alt="הדמות המאוירת של התוכנית"
                        className="home-character"
                    />
                </div>

                <span className="hero-decoration hero-decoration-one">✦</span>
                <span className="hero-decoration hero-decoration-two">✦</span>
            </section>

            <section className="home-about" id="about">
                <div className="about-image-area">
                    <div className="about-booklet">
                        <img src={character} alt="הדמות המאוירת של התוכנית" />
                        <span>מערך תוכן</span>
                    </div>
                    <span className="about-spark">✦</span>
                </div>

                <div className="about-content">
                    <span className="home-eyebrow">נעים להכיר</span>

                    <h2>
                        על התוכנית <span>✦</span>
                    </h2>

                    <p>
                        תוכנית הכשרה והעצמה למדריכות ורכזות,
                        המספקת מערכי שיעור איכותיים, ליווי מקצועי
                        וכלים פרקטיים להובלת קבוצות חינוכיות משמעותיות.
                    </p>

                    <a href="#tracks" className="outline-button">
                        קראו עוד ←
                    </a>
                </div>

                <div className="about-leaf" aria-hidden="true">
                    <span>❋</span>
                    <span>♧</span>
                </div>
            </section>

            <section className="home-tracks" id="tracks">
                <div className="home-section-heading">
                    <h2>
                        מסלולי התוכנית <span>✦</span>
                    </h2>
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
                                למאגר השיעורים ←
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-cities" id="cities">
                <div className="home-section-heading">
                    <h2>היכן אנחנו פועלות?</h2>
                    <p>התוכנית מתקיימת במגוון ערים ברחבי הארץ.</p>

                    <svg
                        ref={locationIconRef}
                        className={`cities-location-icon ${locationIconVisible ? 'is-visible' : ''}`}
                        viewBox="0 0 50 50"
                        width="45"
                        height="45"
                        aria-hidden="true"
                    >
                        <path
                            d="M25 45s17-16 17-27a17 17 0 1 0-34 0c0 11 17 27 17 27z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        <circle cx="25" cy="18" r="6" fill="currentColor" />
                    </svg>
                </div>

                <div className="home-cities-carousel">
                    <button
                        type="button"
                        className="cities-arrow"
                        aria-label="הערים הקודמות"
                        onClick={() => {
                            citiesTrackRef.current?.scrollBy({
                                left: -citiesTrackRef.current.clientWidth,
                                behavior: 'smooth',
                            })
                        }}
                    >
                        ‹
                    </button>

                    <div
                        className="home-cities-viewport"
                        ref={citiesTrackRef}
                    >
                        <div className="home-cities-grid">
                            {cities.map((city) => (
                                <article className="home-city-card" key={city.name}>
                                    <img
                                        src={city.image}
                                        alt={`נוף העיר ${city.name}`}
                                    />

                                    <div className="home-city-content">
                                        <h3>{city.name}</h3>
                                        <p>{city.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="cities-arrow"
                        aria-label="הערים הבאות"
                        onClick={() => {
                            citiesTrackRef.current?.scrollBy({
                                left: citiesTrackRef.current.clientWidth,
                                behavior: 'smooth',
                            })
                        }}
                    >
                        ›
                    </button>
                </div>
            </section>

            <section className="home-testimonials" id="testimonials">
                <div className="home-section-heading">
                    <h2>
                        מה מספרות המדריכות? <span>✦</span>
                    </h2>
                </div>

                <div className="home-testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <article className="home-testimonial-card" key={index}>
                            <div className="home-quote-mark">”</div>
                            <p>{testimonial.text}</p>

                            <div className="home-testimonial-author">
                                <div className="home-testimonial-avatar">
                                    {testimonial.initial}
                                </div>
                                <h3>{testimonial.role}</h3>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="home-contact-banner" id="contact">
                <div className="contact-illustration" aria-hidden="true">
                    ✉
                </div>

                <div className="contact-banner-content">
                    <h2>רוצות לשמוע עוד?</h2>
                    <p>
                        נשמח להיות בקשר, לענות על שאלות ולספק מידע נוסף.
                    </p>

                    <button
                        type="button"
                        className="home-primary-button"
                        onClick={onShowContact}
                    >
                        יצירת קשר ←
                    </button>
                </div>
            </section>

            <footer className="home-footer">
                <img src={logo} alt="לוגו התוכנית" />

                <nav>
                    <a href="#home">דף הבית</a>
                    <a href="#about">אודות התוכנית</a>
                    <a href="#tracks">מסלולים</a>
                    <a href="#testimonials">המלצות</a>
                    <a href="#contact">יצירת קשר</a>
                </nav>

                <span>© כל הזכויות שמורות</span>
            </footer>

        </section>
    )
}

export default HomePage