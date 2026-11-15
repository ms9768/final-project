import { useEffect, useState } from "react";
import "../PaymentManagement.css";
import { API_BASE_URL } from "../services/apiConfig";

const API_URL = `${API_BASE_URL}/api/bank-details`;
const EMPTY_DETAILS = {
  accountHolder: "",
  bankName: "",
  bankNumber: "",
  branchNumber: "",
  accountNumber: "",
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "לא ניתן לבצע את הפעולה");
  }

  return data;
}

function BankDetailsForm({ token = "", publicLink = false }) {
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [linkValid, setLinkValid] = useState(!publicLink);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [bankDetailsStatus, setBankDetailsStatus] = useState("");
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkLink() {
      if (!publicLink || !token) return;

      try {
        await requestJson(`${API_URL}/link/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!cancelled) setLinkValid(true);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadStatus() {
      if (publicLink) return;

      try {
        const status = await requestJson(`${API_URL}/me/status`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
          },
        });
        if (!cancelled) setBankDetailsStatus(status.bankDetailsStatus);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      }
    }

    if (publicLink) {
      if (token) checkLink();
    } else {
      loadStatus();
    }

    return () => {
      cancelled = true;
    };
  }, [publicLink, token]);

  function updateField(event) {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const linkSubmission = publicLink;
      const data = await requestJson(
        linkSubmission ? `${API_URL}/link` : `${API_URL}/me`,
        {
          method: linkSubmission ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(linkSubmission
              ? {}
              : {
                  Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
                }),
          },
          body: JSON.stringify({ ...details, ...(token ? { token } : {}) }),
        }
      );

      setBankDetailsStatus(data.bankDetailsStatus);
      setDetails(EMPTY_DETAILS);
      setMessage(data.message);
      if (linkSubmission) {
        setSubmissionComplete(true);
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="bank-details-page" dir="rtl">
      <section className="bank-details-card">
        <p className="eyebrow">פרטי תשלום מאובטחים</p>
        <h1>פרטי חשבון בנק</h1>
        <p className="bank-details-intro">
          הפרטים נשמרים כשהם מוצפנים. הם אינם נשלחים בדוא״ל, והשלמתם אינה
          מאשרת את בקשת ההרשמה.
        </p>

        {loading ? (
          <p role="status">בודקת את הקישור...</p>
        ) : publicLink && submissionComplete ? (
          <p className="bank-details-message" role="status">
            {message}
          </p>
        ) : publicLink && !token ? (
          <p className="bank-details-message error" role="alert">
            הקישור אינו תקף או שפג תוקפו
          </p>
        ) : publicLink && !linkValid ? (
          <p className="bank-details-message error" role="alert">
            {error || "הקישור אינו תקף או שפג תוקפו"}
          </p>
        ) : (
          <>
            {!token && !error && (
              <p className="bank-details-status">
                סטטוס פרטי החשבון:{" "}
                {bankDetailsStatus === "provided" ? "הפרטים עודכנו" : "טרם נמסרו"}
              </p>
            )}

            <form className="bank-details-form" onSubmit={handleSubmit}>
              <label>
                שם בעל/ת החשבון
                <input
                  name="accountHolder"
                  value={details.accountHolder}
                  onChange={updateField}
                  maxLength={120}
                  autoComplete="off"
                  required
                />
              </label>

              <label>
                שם הבנק
                <input
                  name="bankName"
                  value={details.bankName}
                  onChange={updateField}
                  maxLength={100}
                  autoComplete="off"
                  required
                />
              </label>

              <label>
                מספר בנק
                <input
                  name="bankNumber"
                  value={details.bankNumber}
                  onChange={updateField}
                  inputMode="numeric"
                  maxLength={3}
                  autoComplete="off"
                  required
                />
              </label>

              <label>
                מספר סניף
                <input
                  name="branchNumber"
                  value={details.branchNumber}
                  onChange={updateField}
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="off"
                  required
                />
              </label>

              <label>
                מספר חשבון
                <input
                  name="accountNumber"
                  value={details.accountNumber}
                  onChange={updateField}
                  inputMode="numeric"
                  maxLength={20}
                  autoComplete="off"
                  required
                />
              </label>

              {error && (
                <p className="bank-details-message error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="bank-details-message" role="status">
                  {message}
                </p>
              )}

              <button type="submit" disabled={saving}>
                {saving ? "שומרת..." : "שמירת פרטי חשבון"}
              </button>
            </form>

            {!token && bankDetailsStatus === "provided" && (
              <p className="bank-details-note">
                לשמירה מאובטחת, הפרטים הקיימים אינם מוצגים. מילוי הטופס יעדכן אותם.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default BankDetailsForm;
