import logo from '../assets/logo.png'
import character from '../assets/character.png'

import jerusalem from '../assets/cities/jerusalem.jpg'
import beitShemesh from '../assets/cities/beit-shemesh.jpg'
import modiin from '../assets/cities/rechovot.jpg'
import bneiBrak from '../assets/cities/bnei-brak.jpg'

import { useRef } from 'react'
import './HomePage.css'
import {
    Spark,
    ArrowIcon,
    BookIcon,
    CalendarIcon,
    SunIcon,
    PinIcon,
    UserIcon,
    Leaf,
    Envelope,
} from './ui/Decor'

function HomePage({ onShowLessons, onShowContact, onShowLogin }) {
    const citiesTrackRef = useRef(null)

    const tracks = [
        {
            title: 'המסלול הארוך',
            description: 'מאגר שיעורים וחומרי למידה לתהליך לימודי מתמשך.',
            Icon: BookIcon,
            className: 'hp-track-long',
        },
        {
            title: 'המסלול הקצר',
            description: 'חומרי למידה ממוקדים לפעילויות קצרות ומעשיות.',
            Icon: CalendarIcon,
            className: 'hp-track-short',
        },
        {
            title: 'מסלול קיץ',
            description: 'רעיונות, פעילויות וחומרי הוראה לתקופת הקיץ.',
            Icon: SunIcon,
            className: 'hp-track-summer',
        },
    ]

    const cities = [
        { name: 'ירושלים', image: jerusalem },
        { name: 'בית שמש', image: beitShemesh },
        { name: 'מודיעין', image: modiin },
        { name: 'בני ברק', image: bneiBrak },
    ]

    const testimonials = [
        {
            text: 'המערכת עוזרת לי למצוא חומרי הוראה ולארגן את השיעורים במקום אחד.',
            name: 'מורה בתוכנית',
        },
        {
            text: 'שיתוף הרעיונות והתגובות מאפשר לנו ללמוד מהניסיון של עמיתים.',
            name: 'רכזת התוכנית',
        },
        {
            text: 'קל יותר לאתר קבצים, לעיין בתכנים ולהיעזר בחומרים שכבר הוכנו.',
            name: 'משתתף בתוכנית',
        },
    ]

    const navLinks = [
        { href: '#home', label: 'דף הבית' },
        { href: '#about', label: 'אודות התוכנית' },
        { href: '#tracks', label: 'מסלולים' },
        { href: '#cities', label: 'היכן אנחנו פועלות?' },
        { href: '#testimonials', label: 'המלצות' },
        { href: '#contact', label: 'יצירת קשר' },
    ]

    function scrollCities(direction) {
        const track = citiesTrackRef.current
        if (!track) return
        // ב-RTL "הבא" זז שמאלה
        track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
    }

    return (
        <section className="home-page hp" dir="rtl">

            {/* ---------- תפריט עליון ---------- */}
            <header className="hp-header">
                <a href="#home" className="hp-logo-link">
                    <img src={logo} alt="מבט לגובה" className="hp-logo" />
                </a>

                <nav className="hp-nav" aria-label="ניווט ראשי">
                    {navLinks.map((link, index) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={index === 0 ? 'is-active' : ''}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <button type="button" className="hp-login" onClick={onShowLogin}>
                    <UserIcon />
                    כניסה למערכת
                </button>
            </header>

            {/* ---------- Hero ---------- */}
            <section className="hp-hero" id="home">
                <div className="hp-hero-inner">
                    <div className="hp-hero-text">
                        <h1>
                            מבט לגובה
                            <svg className="hp-underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                                <path d="M4 14C80 4 200 2 296 10" />
                            </svg>
                        </h1>

                        <p>
                            תכנית שקיימת בתוך המערכת הלימודית -
                            <br />
                            בבתי  ספר לכיתות ח'
                            <br />
                            התוכנית מכירה לבנות את מאפיניי גיל ההתבגרות
                            <br />
                            ממשק עם הנושאים, מנחה חיצונית
                            <br />
                            קבוצות קטנות שמאפשרות שיח בונה
                            <br />
                            עוד מבוגר משמעותי בחיים מעבר למעגלי ההורים והממסד

                        </p>

                        <a
                            href="#about"
                            className="hp-btn hp-btn-mint"
                            onClick={(event) => {
                                event.preventDefault()
                                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                        >
                            עוד על התוכנית
                            <ArrowIcon />
                        </a>
                    </div>

                    <div className="hp-hero-figure">
                        <Spark className="hp-hero-spark" />
                        <img src={character} alt="" className="hp-character" />
                    </div>
                </div>

                <svg className="hp-drops" viewBox="0 0 60 60" aria-hidden="true">
                    <path d="M20 8c6 10 8 20 2 26-6-2-8-12-2-26z" />
                    <path d="M42 18c3 8 3 15-2 19-4-3-4-10 2-19z" />
                    <path d="M12 38c4 5 5 10 1 13-3-2-4-7-1-13z" />
                </svg>

                {/* גל תחתון */}
                <svg className="hp-hero-wave" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">
                    <path className="hp-wave-shadow" d="M0 80C260 140 520 30 820 60s420 70 620 10V140H0z" />
                    <path d="M0 100C280 150 560 40 860 75s400 55 580 5V140H0z" />
                </svg>
            </section>

            {/* ---------- על התוכנית ---------- */}
            <section className="hp-about hp-section" id="about">
                <Leaf />

                <div className="hp-about-text">
                    <h2 className="hp-title">
                        על התוכנית <Spark />
                    </h2>
                    <p>
                        תוכנית הכשרה והעצמה למדריכות ורכזות,
                        המספקת מערכי שיעור איכותיים, ליווי מקצועי וכלים
                        פרקטיים להובלת קבוצות חינוכיות משמעותיות.
                    </p>
                    <a href="#tracks" className="hp-btn hp-btn-outline">
                        קראו עוד
                        <ArrowIcon />
                    </a>
                </div>

                <div className="hp-booklets" aria-hidden="true">
                    <Spark className="hp-booklets-spark" />
                    {[0, 1, 2].map((i) => (
                        <div className="hp-booklet" key={i} style={{ '--i': i }}>
                            {i === 2 && (
                                <>
                                    <span className="hp-booklet-title">מערך<br />תוכן</span>
                                    <img src={character} alt="" />
                                    <img src={logo} alt="" className="hp-booklet-logo" />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------- מסלולים ---------- */}
            <section className="hp-tracks hp-section" id="tracks">
                <h2 className="hp-title hp-title-center">
                    מסלולי התוכנית <Spark />
                </h2>

                <div className="hp-tracks-grid">
                    <Spark className="hp-tracks-spark-a" />
                    <Spark className="hp-tracks-spark-b" />
                    {tracks.map(({ title, description, Icon, className }) => (
                        <article className={`hp-track ${className}`} key={title}>
                            <div className="hp-track-icon"><Icon /></div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* ---------- ערים ---------- */}
            <section className="hp-cities hp-section" id="cities">
                <h2 className="hp-title hp-title-center">
                    <span className="hp-title-pin"><PinIcon /></span>
                    היכן אנחנו פועלים?
                    <Spark />
                </h2>
                <p className="hp-subtitle">התוכנית מתקיימת במגוון ערים ברחבי הארץ.</p>

                <div className="hp-carousel">
                    <button type="button" className="hp-carousel-arrow" aria-label="הערים הקודמות" onClick={() => scrollCities(1)}>
                        ›
                    </button>

                    <div className="hp-carousel-viewport" ref={citiesTrackRef}>
                        {cities.map((city) => (
                            <article className="hp-city" key={city.name}>
                                <img src={city.image} alt={`נוף העיר ${city.name}`} />
                                <span className="hp-city-label">
                                    <PinIcon />
                                    {city.name}
                                </span>
                            </article>
                        ))}
                    </div>

                    <button type="button" className="hp-carousel-arrow" aria-label="הערים הבאות" onClick={() => scrollCities(-1)}>
                        ‹
                    </button>
                </div>
            </section>

            {/* ---------- המלצות ---------- */}
            <section className="hp-testimonials" id="testimonials">
                <svg className="hp-band-wave hp-band-wave-top" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 80V40C300 0 600 10 900 35s400 20 540-5V80z" />
                </svg>

                <div className="hp-testimonials-inner hp-section">
                    <h2 className="hp-title hp-title-center">
                        מה מספרות המדריכות? <Spark />
                    </h2>

                    <div className="hp-testimonials-grid">
                        {testimonials.map((t) => (
                            <article className="hp-quote" key={t.name}>
                                <span className="hp-quote-mark" aria-hidden="true">”</span>
                                <p>{t.text}</p>
                                <div className="hp-quote-author">
                                    <span className="hp-avatar"><UserIcon /></span>
                                    {t.name}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <svg className="hp-band-wave hp-band-wave-bottom" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 0V40C260 80 620 60 940 40s380-20 500 5V0z" />
                </svg>
            </section>

            {/* ---------- יצירת קשר ---------- */}
            <section className="hp-section" id="contact">
                <div className="hp-contact">
                    <div className="hp-contact-text">
                        <h2>רוצות לשמוע עוד?</h2>
                        <p>נשמח להיות בקשר, לענות על שאלות ולספק מידע נוסף.</p>
                        <button type="button" className="hp-btn hp-btn-mint" onClick={onShowContact}>
                            יצירת קשר
                            <ArrowIcon />
                        </button>
                    </div>
                    <div className="hp-contact-art">
                        <Spark className="hp-contact-spark" />
                        <Envelope />
                    </div>
                </div>
            </section>

            {/* ---------- פוטר ---------- */}
            <footer className="hp-footer">
                <img src={logo} alt="מבט לגובה" className="hp-footer-logo" />

                <nav className="hp-footer-nav" aria-label="ניווט תחתון">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href}>{link.label}</a>
                    ))}
                </nav>

                <span className="hp-copyright">© כל הזכויות שמורות</span>
            </footer>
        </section>
    )
}

export default HomePage
