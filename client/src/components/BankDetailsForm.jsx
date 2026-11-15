import { useEffect, useState } from "react";
import "../PaymentManagement.css";
import "./AdminPages.css";
import "./BankDetails.css";
import logo from "../assets/logo.png";
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

  function Field({ name, label, maxLength, numeric = false, wide = false }) {
    return (
      <label className={`adm-field ${wide ? "adm-field-wide" : ""}`}>
        <span>{label}</span>
        <input
          name={name}
          value={details[name]}
          onChange={updateField}
          maxLength={maxLength}
          autoComplete="off"
          required
          {...(numeric ? { inputMode: "numeric", dir: "ltr" } : {})}
        />
      </label>
    );
  }

  function Alert({ text, isError = false }) {
    return (
      <p className={`hp-alert ${isError ? "hp-alert-error" : "hp-alert-success"}`} role={isError ? "alert" : "status"}>
        <span aria-hidden="true">{isError ? "!" : "✓"}</span>
        {text}
      </p>
    );
  }

  const content = (
    <section className="bd-card">
      <div className="bd-head">
        <span className="bd-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" />
          </svg>
        </span>
        <div>
          <span className="bd-eyebrow">פרטי תשלום מאובטחים</span>
          <h2>פרטי חשבון בנק</h2>
        </div>

        {!publicLink && !loading && !error && bankDetailsStatus && (
          <span className={`adm-tag ${bankDetailsStatus === "provided" ? "bd-tag-ok" : "bd-tag-missing"}`}>
            {bankDetailsStatus === "provided" ? "הפרטים עודכנו" : "טרם נמסרו"}
          </span>
        )}
      </div>

      <p className="bd-intro">
        הפרטים נשמרים כשהם מוצפנים. הם אינם נשלחים בדוא״ל, והשלמתם אינה
        מאשרת את בקשת ההרשמה.
      </p>

      {loading ? (
        <p className="adm-state" role="status">בודקת את הקישור...</p>
      ) : publicLink && submissionComplete ? (
        <Alert text={message} />
      ) : publicLink && !token ? (
        <Alert text="הקישור אינו תקף או שפג תוקפו" isError />
      ) : publicLink && !linkValid ? (
        <Alert text={error || "הקישור אינו תקף או שפג תוקפו"} isError />
      ) : (
        <>
          <form className="bd-form" onSubmit={handleSubmit}>
            <div className="adm-grid bd-grid">
              {Field({ name: "accountHolder", label: "שם בעל/ת החשבון", maxLength: 120, wide: true })}
              {Field({ name: "bankName", label: "שם הבנק", maxLength: 100 })}
              {Field({ name: "bankNumber", label: "מספר בנק", maxLength: 3, numeric: true })}
              {Field({ name: "branchNumber", label: "מספר סניף", maxLength: 4, numeric: true })}
              {Field({ name: "accountNumber", label: "מספר חשבון", maxLength: 20, numeric: true })}
            </div>

            {error && <Alert text={error} isError />}
            {message && <Alert text={message} />}

            <button type="submit" className="hp-btn hp-btn-purple" disabled={saving}>
              {saving ? "שומרת..." : "שמירת פרטי חשבון"}
            </button>
          </form>

          {!token && bankDetailsStatus === "provided" && (
            <p className="bd-note">
              לשמירה מאובטחת, הפרטים הקיימים אינם מוצגים. מילוי הטופס יעדכן אותם.
            </p>
          )}
        </>
      )}
    </section>
  );

  // בתוך המערכת העמוד עטוף ב-PageShell (מ-App). בקישור ציבורי - עמוד ממותג עצמאי
  if (!publicLink) return content;

  return (
    <main className="hp bd-public" dir="rtl">
      <img src={logo} alt="מבט לגובה" className="bd-public-logo" />
      {content}
    </main>
  );
}

export default BankDetailsForm;
