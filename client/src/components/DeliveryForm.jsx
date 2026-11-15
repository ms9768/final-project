
import { useCallback, useEffect, useState } from "react";
import "./DeliveryForm.css";
import "./AdminPages.css";

const API_URL = "http://localhost:7001/api/deliveries";

// סדר השלבים - לפס ההתקדמות של כל משלוח
const STATUS_STEPS = ["pending", "approved", "on_the_way", "delivered"];

const STEP_SHORT_LABELS = {
  pending: "נשלח",
  approved: "אושר",
  on_the_way: "בדרך",
  delivered: "נמסר",
};

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

  function Field({ name, label, type = "text", wide = false, full = false, required = true, dir }) {
    return (
      <label className={`adm-field ${wide ? "adm-field-wide" : ""} ${full ? "adm-field-full" : ""}`}>
        <span>
          {label}
          {required && <em aria-hidden="true"> *</em>}
        </span>
        <input
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          dir={dir}
        />
      </label>
    );
  }

  return (
    <div className="adm dlv">
      <section className="adm-card dlv-form">
        <div className="settings-section-head">
          <span className="settings-badge settings-badge-mint">＋</span>
          <div>
            <h2 className="adm-card-title">פתיחת משלוח חדש</h2>
            <p>הבקשה נשלחת למייל המשלוחן שמוגדר בהגדרות המערכת</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-grid">
            {Field({ name: "recipientName", label: "שם המקבל" })}
            {Field({ name: "phone", label: "טלפון", type: "tel", dir: "ltr" })}
            {Field({ name: "deliveryDate", label: "תאריך משלוח", type: "date" })}
            {Field({ name: "city", label: "עיר" })}
            {Field({ name: "address", label: "כתובת מלאה", wide: true })}
            {Field({ name: "items", label: "פריטים למשלוח", full: true })}

            <label className="adm-field adm-field-full">
              <span>הערות למשלוח</span>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </label>
          </div>

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

          <button type="submit" className="hp-btn hp-btn-purple" disabled={saving}>
            {saving ? "שולח בקשה..." : "שליחת בקשת משלוח"}
          </button>
        </form>
      </section>

      <section className="dlv-tracking">
        <div className="dlv-tracking-head">
          <h2 className="adm-card-title">מעקב משלוחים</h2>
          <span className="dlv-live">
            <span className="dlv-live-dot" aria-hidden="true" />
            מתעדכן אוטומטית
          </span>
        </div>

        {loading ? (
          <p className="adm-state">טוען משלוחים...</p>
        ) : deliveries.length === 0 ? (
          <p className="adm-state">עדיין לא נוצרו משלוחים.</p>
        ) : (
          <div className="dlv-list">
            {deliveries.map((delivery) => {
              const stepIndex = STATUS_STEPS.indexOf(delivery.status);

              return (
                <article className="dlv-item" key={delivery._id}>
                  <div className="dlv-item-head">
                    <div>
                      <h3>{delivery.recipientName}</h3>
                      <span className="dlv-address">
                        {delivery.city}, {delivery.address}
                      </span>
                    </div>
                    <span className={`adm-tag dlv-tag-${delivery.status}`}>
                      {STATUS_LABELS[delivery.status] || delivery.status}
                    </span>
                  </div>

                  {/* פס התקדמות */}
                  <ol className="dlv-steps" aria-label="שלבי המשלוח">
                    {STATUS_STEPS.map((step, index) => (
                      <li
                        key={step}
                        className={index <= stepIndex ? "is-done" : ""}
                        aria-current={index === stepIndex ? "step" : undefined}
                      >
                        <span className="dlv-step-dot" aria-hidden="true">
                          {index < stepIndex || (step === "delivered" && index === stepIndex) ? "✓" : index + 1}
                        </span>
                        {STEP_SHORT_LABELS[step]}
                      </li>
                    ))}
                  </ol>

                  <dl className="dlv-details">
                    <div>
                      <dt>טלפון</dt>
                      <dd dir="ltr">{delivery.phone}</dd>
                    </div>
                    <div>
                      <dt>תאריך משלוח</dt>
                      <dd>{formatDate(delivery.deliveryDate)}</dd>
                    </div>
                    <div className="dlv-details-wide">
                      <dt>פריטים</dt>
                      <dd>{delivery.items}</dd>
                    </div>
                    {delivery.notes && (
                      <div className="dlv-details-wide">
                        <dt>הערות</dt>
                        <dd>{delivery.notes}</dd>
                      </div>
                    )}
                    {delivery.estimatedArrival && (
                      <div>
                        <dt>הגעה משוערת</dt>
                        <dd>{formatDate(delivery.estimatedArrival)}</dd>
                      </div>
                    )}
                    {delivery.deliveredAt && (
                      <div>
                        <dt>זמן מסירה</dt>
                        <dd>{formatDate(delivery.deliveredAt)}</dd>
                      </div>
                    )}
                  </dl>

                  {delivery.deliveryPhoto && (
                    <a
                      className="dlv-photo"
                      href={`http://localhost:7001${delivery.deliveryPhoto}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={`http://localhost:7001${delivery.deliveryPhoto}`}
                        alt="תמונת המשלוח לאחר מסירה"
                      />
                      <span>תמונת המסירה</span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default DeliveryForm;
