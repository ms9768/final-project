
import { useEffect, useState } from "react";

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
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>טוען הגדרות...</p>;

  return (
    <section className="settings-panel">
      <h2>ניהול תעריפים ותקציבים</h2>

      <form onSubmit={handleSave}>
        <label>
          תקציב כיבוד למשתתף (₪)
          <input
            type="number"
            name="refreshmentsBudgetPerParticipant"
            min="0"
            step="0.01"
            value={settings.refreshmentsBudgetPerParticipant}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          תשלום למנחה צעירה עבור פגישה (₪)
          <input
            type="number"
            name="youngFacilitatorPaymentPerMeeting"
            min="0"
            step="0.01"
            value={settings.youngFacilitatorPaymentPerMeeting}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          תשלום למנחה בוגרת עבור פגישה (₪)
          <input
            type="number"
            name="seniorFacilitatorPaymentPerMeeting"
            min="0"
            step="0.01"
            value={settings.seniorFacilitatorPaymentPerMeeting}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          תוספת למנחה בוגרת עבור שיחה ממושכת (₪)
          <input
            type="number"
            name="seniorProlongedConversationBonus"
            min="0"
            step="0.01"
            value={settings.seniorProlongedConversationBonus}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          תשלום שכירות עבור כל פגישה (₪)
          <input
            type="number"
            name="rentalPaymentPerMeeting"
            min="0"
            step="0.01"
            value={settings.rentalPaymentPerMeeting}
            onChange={handleChange}
            required
          />
        </label>

        <hr />

        <h3>הגדרות משלוחים</h3>

        <label>
          כתובת מייל של המשלוחן
          <input
            type="email"
            name="deliveryEmail"
            value={settings.deliveryEmail}
            onChange={handleChange}
            placeholder="delivery@example.com"
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "שומר..." : "שמירת הגדרות"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}

export default SystemSettings;
