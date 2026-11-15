
import { useCallback, useEffect, useState } from "react";
import "./DeliveryForm.css";

const API_URL = "http://localhost:7001/api/deliveries";

const STATUS_LABELS = {
  pending: "ממתין לאישור המשלוחן",
  approved: "המשלוח אושר",
  on_the_way: "המשלוח בדרך",
  delivered: "המשלוח נמסר",
};

function DeliveryForm() {
  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    city: "",
    address: "",
    deliveryDate: "",
    items: "",
    notes: "",
  });

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const authToken = sessionStorage.getItem("authToken") || "";

  const loadDeliveries = useCallback(async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "טעינת המשלוחים נכשלה");
      }

      setDeliveries(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "לא ניתן לטעון את המשלוחים");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadDeliveries();

    const interval = setInterval(loadDeliveries, 5000);

    return () => clearInterval(interval);
  }, [loadDeliveries]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "יצירת המשלוח נכשלה");
      }

      setMessage("המשלוח נוצר ובקשת המשלוח נשלחה לכתובת שהוגדרה בהגדרות המערכת.");

      setFormData({
        recipientName: "",
        phone: "",
        city: "",
        address: "",
        deliveryDate: "",
        items: "",
        notes: "",
      });

      await loadDeliveries();
    } catch (err) {
      setError(err.message || "אירעה שגיאה ביצירת המשלוח");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <main className="delivery-management" dir="rtl">
      <header className="delivery-header">
        <h1>ניהול משלוחים</h1>
        <p>יצירת בקשות משלוח ומעקב אחר ביצוען</p>
      </header>

      <section className="delivery-form-card">
        <h2>פתיחת משלוח חדש</h2>

        <form onSubmit={handleSubmit}>
          <div className="delivery-form-grid">
            <label>
              שם המקבל *
              <input
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              טלפון *
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              עיר *
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              כתובת מלאה *
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              תאריך משלוח *
              <input
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              פריטים למשלוח *
              <input
                name="items"
                value={formData.items}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="delivery-full-width">
            הערות למשלוח
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </label>

          {error && (
            <p className="status-message error">{error}</p>
          )}

          {message && (
            <p className="status-message">{message}</p>
          )}

          <button type="submit" disabled={saving}>
            {saving ? "שולח בקשה..." : "שליחת בקשת משלוח"}
          </button>
        </form>
      </section>

      <section className="delivery-list-section">
        <div className="delivery-list-header">
          <h2>מעקב משלוחים</h2>
          <span>הנתונים מתעדכנים אוטומטית</span>
        </div>

        {loading ? (
          <p>טוען משלוחים...</p>
        ) : deliveries.length === 0 ? (
          <p>עדיין לא נוצרו משלוחים.</p>
        ) : (
          <div className="delivery-list">
            {deliveries.map((delivery) => (
              <article
                className="delivery-item"
                key={delivery._id}
              >
                <div className="delivery-item-header">
                  <h3>{delivery.recipientName}</h3>
                  <span className={`delivery-status ${delivery.status}`}>
                    {STATUS_LABELS[delivery.status] || delivery.status}
                  </span>
                </div>

                <p><strong>טלפון:</strong> {delivery.phone}</p>
                <p>
                  <strong>כתובת:</strong>{" "}
                  {delivery.city}, {delivery.address}
                </p>
                <p>
                  <strong>תאריך משלוח:</strong>{" "}
                  {formatDate(delivery.deliveryDate)}
                </p>
                <p><strong>פריטים:</strong> {delivery.items}</p>

                {delivery.notes && (
                  <p><strong>הערות:</strong> {delivery.notes}</p>
                )}

                {delivery.estimatedArrival && (
                  <p>
                    <strong>זמן הגעה משוער:</strong>{" "}
                    {formatDate(delivery.estimatedArrival)}
                  </p>
                )}

                {delivery.deliveredAt && (
                  <p>
                    <strong>זמן מסירה:</strong>{" "}
                    {formatDate(delivery.deliveredAt)}
                  </p>
                )}

                {delivery.deliveryPhoto && (
                  <div className="delivery-photo">
                    <strong>תמונת המסירה:</strong>
                    <a
                      href={`http://localhost:7001${delivery.deliveryPhoto}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={`http://localhost:7001${delivery.deliveryPhoto}`}
                        alt="תמונת המשלוח לאחר מסירה"
                      />
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DeliveryForm;
