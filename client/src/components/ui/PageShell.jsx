import { useEffect } from 'react'
import logo from '../../assets/logo.png'
import { Spark, ArrowIcon } from './Decor'
import './PageShell.css'

/*
  מבנה משותף לעמודים הפנימיים:
  פס עליון (לוגו + כפתור חזרה) -> כותרת סגולה עם גל -> התוכן של העמוד

  props:
  - title / subtitle / eyebrow : הטקסטים בכותרת
  - onBack, backLabel           : כפתור החזרה (אם אין onBack - אין כפתור)
  - art                          : איור אופציונלי בצד הכותרת
  - children                     : התוכן של העמוד
*/
function PageShell({
    title,
    subtitle,
    eyebrow,
    onBack,
    backLabel = 'חזרה לדף הבית',
    art,
    className = '',
    children,
}) {
    // כל עמוד חדש נפתח מלמעלה (ולא באמצע, איפה שגללנו בעמוד הקודם)
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <section className={`hp ps ${className}`} dir="rtl">
            <header className="ps-topbar">
                <button type="button" className="ps-logo-link" onClick={onBack} aria-label="מבט לגובה - לדף הבית">
                    <img src={logo} alt="מבט לגובה" className="ps-logo" />
                </button>

                {onBack && (
                    <button type="button" className="ps-back" onClick={onBack}>
                        {backLabel}
                        <ArrowIcon />
                    </button>
                )}
            </header>

            <div className="ps-hero">
                <div className="ps-hero-inner">
                    <div className="ps-hero-text">
                        {eyebrow && <span className="ps-eyebrow">{eyebrow}</span>}
                        <h1>
                            {title}
                            <Spark className="ps-hero-spark" />
                        </h1>
                        {subtitle && <p>{subtitle}</p>}
                    </div>

                    {art && <div className="ps-hero-art">{art}</div>}
                </div>

                <svg className="ps-hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
                    <path className="ps-wave-back" d="M0 60C300 120 620 10 920 45s380 50 520 5V120H0z" />
                    <path d="M0 85C320 130 640 30 960 65s360 40 480 0V120H0z" />
                </svg>
            </div>

            <div className="ps-body">{children}</div>
        </section>
    )
}

export default PageShell
