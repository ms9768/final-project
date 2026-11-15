
import { useEffect, useState } from "react";

const API_URL = "http://localhost:7001/api/deliveries";

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

    if (loading) return <p>טוען פרטי משלוח...</p>;

    if (error && !delivery) {
        return <main dir="rtl"><p>{error}</p></main>;
    }

    if (!delivery) return null;

    return (
        <main className="delivery-page" dir="rtl">
            <h1>פרטי משלוח</h1>

            <section className="delivery-details">
                <p><strong>שם המקבל:</strong> {delivery.recipientName}</p>
                <p><strong>טלפון:</strong> {delivery.phone}</p>
                <p><strong>עיר:</strong> {delivery.city}</p>
                <p><strong>כתובת:</strong> {delivery.address}</p>
                <p>
                    <strong>תאריך משלוח:</strong>{" "}
                    {new Date(delivery.deliveryDate).toLocaleDateString("he-IL")}
                </p>
                <p><strong>פריטים:</strong> {delivery.items}</p>
                {delivery.notes && <p><strong>הערות:</strong> {delivery.notes}</p>}
            </section>

            <p><strong>סטטוס:</strong> {
                {
                    pending: "ממתין לאישור",
                    approved: "אושר",
                    on_the_way: "בדרך",
                    delivered: "נמסר",
                }[delivery.status]
            }</p>

            {delivery.status === "pending" && (
                <section>
                    <h2>אישור המשלוח</h2>
                    <label>
                        זמן הגעה משוער
                        <input
                            type="datetime-local"
                            value={estimatedArrival}
                            onChange={(event) => setEstimatedArrival(event.target.value)}
                            required
                        />
                    </label>
                    <button
                        type="button"
                        onClick={confirmDelivery}
                        disabled={saving || !estimatedArrival}
                    >
                        {saving ? "שומר..." : "אישור משלוח"}
                    </button>
                </section>
            )}



            {(delivery.status === "approved" || delivery.status === "on_the_way") && (<form onSubmit={completeDelivery}>
                <h2>אישור מסירה</h2>
                <label>
                    העלאת תמונה של המשלוח ביעד
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => setPhoto(event.target.files?.[0] || null)}
                        required
                    />
                </label>
                <button type="submit" disabled={saving || !photo}>
                    {saving ? "מעלה תמונה..." : "אישור מסירה והעלאת תמונה"}
                </button>
            </form>
            )}

            {delivery.status === "delivered" && (
                <p>המשלוח הושלם בהצלחה. תודה!</p>
            )}

            {error && <p className="status-message error">{error}</p>}
            {message && <p className="status-message">{message}</p>}
        </main>
    );
}

export default DeliveryPersonPage;
