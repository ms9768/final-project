
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5600/api/systemsettings";

function SystemSettings() {
  const [settings, setSettings] = useState({
    refreshmentsBudgetPerParticipant: 12,
    facilitatorPaymentPerMeeting: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "שגיאה בטעינת ההגדרות");
      }

      setSettings({
        refreshmentsBudgetPerParticipant:
          data.refreshmentsBudgetPerParticipant,
        facilitatorPaymentPerMeeting:
          data.facilitatorPaymentPerMeeting,
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
        },
        body: JSON.stringify({
          refreshmentsBudgetPerParticipant: Number(
            settings.refreshmentsBudgetPerParticipant
          ),
          facilitatorPaymentPerMeeting: Number(
            settings.facilitatorPaymentPerMeeting
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "שגיאה בשמירת ההגדרות");
      }

      setSettings({
        refreshmentsBudgetPerParticipant:
          data.refreshmentsBudgetPerParticipant,
        facilitatorPaymentPerMeeting:
          data.facilitatorPaymentPerMeeting,
      });

      setMessage("ההגדרות נשמרו בהצלחה!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>טוען הגדרות...</p>;
  }

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
          תשלום למנחה עבור פגישה (₪)
          <input
            type="number"
            name="facilitatorPaymentPerMeeting"
            min="0"
            step="0.01"
            value={settings.facilitatorPaymentPerMeeting}
            onChange={handleChange}
            required
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
