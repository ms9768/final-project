
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import character from "../assets/character.png";
import "./AdminPages.css";
import "./BankDetails.css";
import "./DeliveryPerson.css";

const API_URL = "http://localhost:7001/api/deliveries";

// מעטפת ממותגת לכל המצבים של העמוד (מוגדרת מחוץ לקומפוננטה כדי שהשדות לא יאבדו פוקוס)
function Shell({ children }) {
    return (
        <main className="hp bd-public dp" dir="rtl">
            <img src={logo} alt="מבט לגובה" className="bd-public-logo" />
            <section className="dp-card">{children}</section>
        </main>
    );
}

function DeliveryPersonPage({ token }) {
    const [delivery, setDelivery] = useState(null);
    const [estimatedArrival, setEstimatedArrival] = useState("");
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadDelivery() {
        try {
            const response = await fetch(`${API_URL}/public/${token}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "לא ניתן לטעון את פרטי המשלוח");
            }

            setDelivery(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDelivery();
    }, []);

    async function confirmDelivery() {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/public/${token}/confirm`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estimatedArrival }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "אישור המשלוח נכשל");
            }

            setMessage("המשלוח אושר בהצלחה!");
            await loadDelivery();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }


    async function completeDelivery(event) {
        event.preventDefault();

        if (!photo) {
            setError("יש לבחור תמונה של המסירה.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("photo", photo);

            const response = await fetch(
                `${API_URL}/public/${token}/complete`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "העלאת התמונה נכשלה");
            }

            setMessage("המשלוח הושלם והתמונה נשמרה בהצלחה.");
            await loadDelivery();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const STEPS = ["pending", "approved", "on_the_way", "delivered"];
    const STEP_LABELS = { pending: "נשלח", approved: "אושר", on_the_way: "בדרך", delivered: "נמסר" };

    if (loading) {
        return (
            <Shell>
                <p className="adm-state">טוען פרטי משלוח...</p>
            </Shell>
        );
    }

    if (error && !delivery) {
        return (
            <Shell>
                <p className="hp-alert hp-alert-error" role="alert">
                    <span aria-hidden="true">!</span>
                    {error}
                </p>
            </Shell>
        );
    }

    if (!delivery) return null;

    const stepIndex = STEPS.indexOf(delivery.status);
    const fullAddress = `${delivery.address}, ${delivery.city}`;

    return (
        <Shell>
            <div className="dp-head">
                <span className="dp-eyebrow">משלוח עבור</span>
                <h1>{delivery.recipientName}</h1>
            </div>

            <ol className="dlv-steps" aria-label="שלבי המשלוח">
                {STEPS.map((step, index) => (
                    <li
                        key={step}
                        className={index <= stepIndex ? "is-done" : ""}
                        aria-current={index === stepIndex ? "step" : undefined}
                    >
                        <span className="dlv-step-dot" aria-hidden="true">
                            {index < stepIndex || (step === "delivered" && index === stepIndex) ? "✓" : index + 1}
                        </span>
                        {STEP_LABELS[step]}
                    </li>
                ))}
            </ol>

            {/* פעולות מהירות למשלוחן */}
            <div className="dp-quick">
                <a className="dp-quick-btn" href={`tel:${delivery.phone}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                    </svg>
                    <span>חיוג</span>
                    <small dir="ltr">{delivery.phone}</small>
                </a>
                <a
                    className="dp-quick-btn"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                        <circle cx="12" cy="10" r="2.6" />
                    </svg>
                    <span>ניווט</span>
                    <small>{fullAddress}</small>
                </a>
            </div>

            <dl className="dlv-details">
                <div>
                    <dt>תאריך משלוח</dt>
                    <dd>{new Date(delivery.deliveryDate).toLocaleDateString("he-IL")}</dd>
                </div>
                <div>
                    <dt>עיר</dt>
                    <dd>{delivery.city}</dd>
                </div>
                <div className="dlv-details-wide">
                    <dt>פריטים</dt>
                    <dd>{delivery.items}</dd>
                </div>
                {delivery.notes && (
                    <div className="dlv-details-wide dp-notes">
                        <dt>הערות</dt>
                        <dd>{delivery.notes}</dd>
                    </div>
                )}
            </dl>

            {delivery.status === "pending" && (
                <section className="dp-action">
                    <h2>אישור המשלוח</h2>
                    <label className="adm-field">
                        <span>מתי משוער שתגיעו?</span>
                        <input
                            type="datetime-local"
                            value={estimatedArrival}
                            onChange={(event) => setEstimatedArrival(event.target.value)}
                            required
                        />
                    </label>
                    <button
                        type="button"
                        className="hp-btn hp-btn-purple dp-big-btn"
                        onClick={confirmDelivery}
                        disabled={saving || !estimatedArrival}
                    >
                        {saving ? "שומר..." : "אישור משלוח"}
                    </button>
                </section>
            )}

            {(delivery.status === "approved" || delivery.status === "on_the_way") && (
                <form className="dp-action" onSubmit={completeDelivery}>
                    <h2>אישור מסירה</h2>

                    <label className={`dp-upload ${photo ? "has-file" : ""}`}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            onChange={(event) => setPhoto(event.target.files?.[0] || null)}
                            required
                        />
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                            <circle cx="12" cy="13" r="3.5" />
                        </svg>
                        <strong>{photo ? "התמונה נבחרה" : "צילום המשלוח ביעד"}</strong>
                        <span>{photo ? photo.name : "לחיצה כאן פותחת את המצלמה או את הגלריה"}</span>
                    </label>

                    <button
                        type="submit"
                        className="hp-btn hp-btn-purple dp-big-btn"
                        disabled={saving || !photo}
                    >
                        {saving ? "מעלה תמונה..." : "אישור מסירה והעלאת תמונה"}
                    </button>
                </form>
            )}

            {delivery.status === "delivered" && (
                <div className="dp-done">
                    <img src={character} alt="" />
                    <strong>המשלוח הושלם בהצלחה. תודה!</strong>
                </div>
            )}

            {error && (
                <p className="hp-alert hp-alert-error" role="alert">
                    <span aria-hidden="true">!</span>
                    {error}
                </p>
            )}
            {message && (
                <p className="hp-alert hp-alert-success" role="status">
                    <span aria-hidden="true">✓</span>
                    {message}
                </p>
            )}
        </Shell>
    );
}

export default DeliveryPersonPage;
