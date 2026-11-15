
import { useEffect, useState } from "react";
import "./AdminPages.css";

const API_URL = "http://localhost:7001/api/systemsettings";

function SystemSettings() {
  const [settings, setSettings] = useState({
    refreshmentsBudgetPerParticipant: 12,
    youngFacilitatorPaymentPerMeeting: 0,
    seniorFacilitatorPaymentPerMeeting: 0,
    seniorProlongedConversationBonus: 0,
    rentalPaymentPerMeeting: 0,
    deliveryEmail: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "שגיאה בטעינת ההגדרות");
      }

      setSettings({
        refreshmentsBudgetPerParticipant:
          data.refreshmentsBudgetPerParticipant,
        youngFacilitatorPaymentPerMeeting:
          data.youngFacilitatorPaymentPerMeeting,
        seniorFacilitatorPaymentPerMeeting:
          data.seniorFacilitatorPaymentPerMeeting,
        seniorProlongedConversationBonus:
          data.seniorProlongedConversationBonus ?? 0,
        rentalPaymentPerMeeting:
          data.rentalPaymentPerMeeting ?? 0,
        deliveryEmail: data.deliveryEmail || "",
      });
    } catch (error) {
      setMessage(error.message);
      setMessageIsError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          refreshmentsBudgetPerParticipant: Number(
            settings.refreshmentsBudgetPerParticipant
          ),
          youngFacilitatorPaymentPerMeeting: Number(
            settings.youngFacilitatorPaymentPerMeeting
          ),
          seniorFacilitatorPaymentPerMeeting: Number(
            settings.seniorFacilitatorPaymentPerMeeting
          ),
          seniorProlongedConversationBonus: Number(
            settings.seniorProlongedConversationBonus
          ),
          rentalPaymentPerMeeting: Number(
            settings.rentalPaymentPerMeeting
          ),
          deliveryEmail: settings.deliveryEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "שגיאה בשמירת ההגדרות");
      }

      setSettings({
        refreshmentsBudgetPerParticipant:
          data.refreshmentsBudgetPerParticipant,
        youngFacilitatorPaymentPerMeeting:
          data.youngFacilitatorPaymentPerMeeting,
        seniorFacilitatorPaymentPerMeeting:
          data.seniorFacilitatorPaymentPerMeeting,
        seniorProlongedConversationBonus:
          data.seniorProlongedConversationBonus ?? 0,
        rentalPaymentPerMeeting:
          data.rentalPaymentPerMeeting ?? 0,
        deliveryEmail: data.deliveryEmail || "",
      });

      setMessage("ההגדרות נשמרו בהצלחה!");
      setMessageIsError(false);
    } catch (error) {
      setMessage(error.message);
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="adm-state">טוען הגדרות...</p>;

  // שדה מספר עם סימן ₪ בצד
  function MoneyField({ name, label, hint }) {
    return (
      <label className="adm-field">
        <span>{label}</span>
        <div className="adm-money">
          <input
            type="number"
            name={name}
            min="0"
            step="0.01"
            value={settings[name]}
            onChange={handleChange}
            required
          />
          <em aria-hidden="true">₪</em>
        </div>
        {hint && <small>{hint}</small>}
      </label>
    );
  }

  return (
    <form className="adm settings" onSubmit={handleSave}>
      <section className="adm-card settings-section">
        <div className="settings-section-head">
          <span className="settings-badge settings-badge-mint">₪</span>
          <div>
            <h2 className="adm-card-title">תשלום למנחות</h2>
            <p>הסכום שמשולם על כל פגישה שאושרה</p>
          </div>
        </div>

        <div className="adm-grid">
          {MoneyField({ name: "youngFacilitatorPaymentPerMeeting", label: "מנחה צעירה – לפגישה" })}
          {MoneyField({ name: "seniorFacilitatorPaymentPerMeeting", label: "מנחה בוגרת – לפגישה" })}
          {MoneyField({
            name: "seniorProlongedConversationBonus",
            label: "תוספת לשיחה ממושכת",
            hint: "למנחה בוגרת בלבד",
          })}
        </div>
      </section>

      <section className="adm-card settings-section">
        <div className="settings-section-head">
          <span className="settings-badge settings-badge-yellow">☕</span>
          <div>
            <h2 className="adm-card-title">תקציבים</h2>
            <p>כיבוד ושכירות לכל פגישה</p>
          </div>
        </div>

        <div className="adm-grid">
          {MoneyField({ name: "refreshmentsBudgetPerParticipant", label: "תקציב כיבוד למשתתף" })}
          {MoneyField({ name: "rentalPaymentPerMeeting", label: "תשלום שכירות לפגישה" })}
        </div>
      </section>

      <section className="adm-card settings-section">
        <div className="settings-section-head">
          <span className="settings-badge settings-badge-purple">✉</span>
          <div>
            <h2 className="adm-card-title">הגדרות משלוחים</h2>
            <p>לאן נשלחים טפסי המשלוח</p>
          </div>
        </div>

        <label className="adm-field">
          <span>כתובת מייל של המשלוחן</span>
          <input
            type="email"
            name="deliveryEmail"
            value={settings.deliveryEmail}
            onChange={handleChange}
            placeholder="delivery@example.com"
            dir="ltr"
          />
        </label>
      </section>

      <div className="settings-footer">
        {message && (
          <p
            className={`hp-alert ${messageIsError ? "hp-alert-error" : "hp-alert-success"}`}
            role={messageIsError ? "alert" : "status"}
          >
            <span aria-hidden="true">{messageIsError ? "!" : "✓"}</span>
            {message}
          </p>
        )}

        <button type="submit" className="hp-btn hp-btn-purple" disabled={saving}>
          {saving ? "שומר..." : "שמירת הגדרות"}
        </button>
      </div>
    </form>
  );
}

export default SystemSettings;
