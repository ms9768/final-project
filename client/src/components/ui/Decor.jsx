/* ---------- אייקונים וקישוטים קטנים (SVG) ---------- */

// שלושה קווים צהובים קטנים - ה"ניצוץ" שחוזר לאורך כל העיצוב
export function Spark({ className = '' }) {
    return (
        <svg className={`hp-spark ${className}`} viewBox="0 0 40 40" aria-hidden="true">
            <path d="M8 22 L2 18" />
            <path d="M16 13 L13 4" />
            <path d="M27 12 L32 4" />
        </svg>
    )
}

export function ArrowIcon() {
    return (
        <svg className="hp-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
    )
}

export function BookIcon() {
    return (
        <svg viewBox="0 0 64 48" aria-hidden="true">
            <path d="M32 10C25 4 14 3 4 5v36c10-2 21-1 28 5 7-6 18-7 28-5V5C50 3 39 4 32 10z" />
            <path d="M32 10v36" />
        </svg>
    )
}

export function CalendarIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
            <rect x="5" y="8" width="38" height="35" rx="6" />
            <path d="M5 18h38M15 3v10M33 3v10" />
            <path d="M13 25h4M22 25h4M31 25h4M13 33h4M22 33h4M31 33h4" />
        </svg>
    )
}

export function SunIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="9" className="hp-sun-core" />
            <path d="M24 3v7M24 38v7M3 24h7M38 24h7M9 9l5 5M34 34l5 5M39 9l-5 5M14 34l-5 5" />
        </svg>
    )
}

export function PinIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.6" className="hp-pin-dot" />
        </svg>
    )
}

export function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7" />
        </svg>
    )
}

export function Leaf() {
    // עלה אחד מצויר בנקודה 0,0 ומופנה למעלה; כל עלה על הענף הוא עותק שלו עם הזזה וסיבוב
    const leaves = [
        { x: 80, y: 150, r: -38, s: 0.78 },
        { x: 92, y: 142, r: 62, s: 0.8 },
        { x: 100, y: 116, r: -28, s: 0.85 },
        { x: 106, y: 108, r: 58, s: 0.85 },
        { x: 120, y: 76, r: 18, s: 0.9 },
    ]

    return (
        <svg className="hp-leaf" viewBox="0 0 200 200" aria-hidden="true">
            <path
                className="hp-leaf-blob"
                d="M98 22c30-6 62 4 80 30 18 27 12 62-6 90-18 29-50 46-82 42-30-4-58-24-66-54-8-31 6-60 28-82 13-13 28-23 46-26z"
            />
            <g className="hp-leaf-branch">
                <path className="hp-leaf-stem" d="M40 190C68 164 96 124 120 76" />
                {leaves.map((leaf, i) => (
                    <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}>
                        <path className="hp-leaf-shape" d="M0 0C-19-12-20-38 0-56 20-38 19-12 0 0z" />
                        <path className="hp-leaf-vein" d="M0-4V-46" />
                    </g>
                ))}
            </g>
        </svg>
    )
}

export function Envelope() {
    return (
        <svg className="hp-envelope" viewBox="0 0 260 120" aria-hidden="true">
            <path className="hp-envelope-trail" d="M100 75c40 25 80 30 105 10 20-16 5-40-15-30-18 10-5 40 60 40" />
            <g transform="rotate(-14 55 60)">
                <rect x="10" y="30" width="90" height="60" rx="4" className="hp-envelope-body" />
                <path d="M10 30l45 34 45-34" />
            </g>
        </svg>
    )
}

/* ---------- אייקונים ללוחות הבקרה ---------- */

function LineIcon({ children }) {
    return (
        <svg className="hp-line-icon" viewBox="0 0 24 24" aria-hidden="true">
            {children}
        </svg>
    )
}

export const DashboardIcons = {
    approvals: () => (
        <LineIcon>
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21c.8-4 3.6-6 7-6 1.6 0 3 .4 4.2 1.2M15 19l2 2 4-4" />
        </LineIcon>
    ),
    reports: () => (
        <LineIcon>
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
        </LineIcon>
    ),
    payments: () => (
        <LineIcon>
            <ellipse cx="12" cy="7" rx="7" ry="3" />
            <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
        </LineIcon>
    ),
    settings: () => (
        <LineIcon>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
        </LineIcon>
    ),
    contacts: () => (
        <LineIcon>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
        </LineIcon>
    ),
    lessons: () => (
        <LineIcon>
            <path d="M12 6C9.5 4 6 3.5 3 4.2V19c3-.7 6.5-.2 9 1.8 2.5-2 6-2.5 9-1.8V4.2C18 3.5 14.5 4 12 6z" />
            <path d="M12 6v14.8" />
        </LineIcon>
    ),
    delivery: () => (
        <LineIcon>
            <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
        </LineIcon>
    ),
    meetings: () => (
        <LineIcon>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
        </LineIcon>
    ),
    meetingApprovals: () => (
        <LineIcon>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
        </LineIcon>
    ),
    messages: () => (
        <LineIcon>
            <path d="M4 5h16v11H9l-5 4z" />
            <path d="M8 9h8M8 12h5" />
        </LineIcon>
    ),
    'new-report': () => (
        <LineIcon>
            <path d="M4 20h4L19 9l-4-4L4 16v4z" />
            <path d="M13.5 6.5l4 4" />
        </LineIcon>
    ),
    'bank-details': () => (
        <LineIcon>
            <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
        </LineIcon>
    ),
}
