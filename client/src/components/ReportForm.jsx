
import { useEffect, useState } from "react";

const schools = [
  "בית יעקב בנות שרה – בני ברק",
  "בית יעקב בנות ויזניץ – בית שמש",
  "בית חינוך לבנות – בני ברק",
  "בית מלכה – אשדוד",
  "בית מלכה – בני ברק",
  "בית מלכה – בית שמש",
  "בית מלכה – חיפה",
  "בית יעקב גילה – ירושלים",
  "בית יעקב היובל – ירושלים",
  "בית יעקב נאות הפסגה – מודיעין עילית",
];

const classes = Array.from(
  { length: 20 },
  (_, index) => `ח-${index + 1}`
);

const groupNumbers = [1, 2, 3];

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
}

function ReportForm({
  facilitatorLevel,
  onSubmit,
  onCancel,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    schoolName: "",
    className: "",
    groupNumber: "",
    meetingDate: "",
    topic: "",
    participantCount: "",
    refreshmentsCost: "",
    meetingLocation: "",
    prolongedConversation: false,
  });

  const [receipt, setReceipt] = useState(null);
  const isEditing = Boolean(initialData);
  const isSenior = facilitatorLevel === "senior";

  useEffect(() => {
    if (initialData) {
      setFormData({
        schoolName: initialData.schoolName || "",
        className: initialData.className || "",
        groupNumber: initialData.groupNumber ?? "",
        meetingDate: formatDateForInput(initialData.meetingDate),
        topic: initialData.topic || "",
        participantCount: initialData.participantCount ?? "",
        refreshmentsCost: initialData.refreshmentsCost ?? "",
        meetingLocation: initialData.meetingLocation || "",
        prolongedConversation:
          initialData.prolongedConversation || false,
      });
    } else {
      setFormData({
        schoolName: "",
        className: "",
        groupNumber: "",
        meetingDate: "",
        topic: "",
        participantCount: "",
        refreshmentsCost: "",
        meetingLocation: "",
        prolongedConversation: false,
      });
    }

    setReceipt(null);
  }, [initialData]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleReceiptChange(event) {
    const selectedFile = event.target.files[0];
    setReceipt(selectedFile || null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // אם דווחו הוצאות כיבוד, חובה לצרף קבלה
    // בעריכת דיווח אפשר להשתמש בקבלה שכבר קיימת
    if (
      Number(formData.refreshmentsCost) > 0 &&
      !receipt &&
      !initialData?.receipt
    ) {
      alert("כדי לדווח על הוצאות כיבוד יש לצרף קבלה");
      return;
    }

    const reportData = {
      ...formData,
      groupNumber: Number(formData.groupNumber),
      participantCount: Number(formData.participantCount),
      refreshmentsCost: Number(formData.refreshmentsCost),
      prolongedConversation: isSenior
        ? formData.prolongedConversation
        : false,
    };

    onSubmit(reportData, receipt);
  }

  return (
    <form className="report-form rf" onSubmit={handleSubmit}>
      <h2>
        {isEditing ? "עריכת דיווח פגישה" : "דיווח על פגישה"}
      </h2>

      <fieldset className="rf-group">
        <legend>איפה התקיימה הפגישה?</legend>

        <div className="rf-grid rf-grid-3">
          <label className="rf-field rf-span-2">
            <span>בית ספר</span>
            <select
              name="schoolName"
              value={formData.schoolName}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  schoolName: event.target.value,
                  className: "",
                  groupNumber: "",
                }))
              }
              required
            >
              <option value="">בחרי בית ספר</option>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </label>

          <label className="rf-field">
            <span>כיתה</span>
            <select
              name="className"
              value={formData.className}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  className: event.target.value,
                  groupNumber: "",
                }))
              }
              disabled={!formData.schoolName}
              required
            >
              <option value="">בחרי כיתה</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </label>

          <label className="rf-field">
            <span>קבוצה</span>
            <select
              name="groupNumber"
              value={formData.groupNumber}
              onChange={handleChange}
              disabled={!formData.className}
              required
            >
              <option value="">בחרי קבוצה</option>
              {groupNumbers.map((number) => (
                <option key={number} value={number}>
                  קבוצה {number}
                </option>
              ))}
            </select>
          </label>

          <label className="rf-field rf-span-2">
            <span>מקום הפגישה</span>
            <select
              name="meetingLocation"
              value={formData.meetingLocation}
              onChange={handleChange}
              required
            >
              <option value="">בחרי מקום פגישה</option>
              <option value="facilitator_home">בבית המנחה</option>
              <option value="organization_venue">מקום מטעם הארגון</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="rf-group">
        <legend>על הפגישה</legend>

        <div className="rf-grid rf-grid-3">
          <label className="rf-field rf-span-2">
            <span>נושא הפגישה</span>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
            />
          </label>

          <label className="rf-field">
            <span>תאריך ושעה</span>
            <input
              type="datetime-local"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleChange}
              required
            />
          </label>

          <label className="rf-field">
            <span>מספר משתתפים</span>
            <input
              type="number"
              name="participantCount"
              min="0"
              value={formData.participantCount}
              onChange={handleChange}
              required
            />
          </label>

          {isSenior && (
            <label className="rf-check rf-span-2">
              <input
                type="checkbox"
                name="prolongedConversation"
                checked={formData.prolongedConversation}
                onChange={handleChange}
              />
              <span>התקיימה שיחה ממושכת עם משתתפת</span>
            </label>
          )}
        </div>
      </fieldset>

      <fieldset className="rf-group">
        <legend>כיבוד וקבלה</legend>

        <div className="rf-grid rf-grid-3">
          <label className="rf-field">
            <span>עלות כיבוד (₪)</span>
            <input
              type="number"
              name="refreshmentsCost"
              min="0"
              value={formData.refreshmentsCost}
              onChange={handleChange}
              required
            />
          </label>

          <label className="rf-field rf-file rf-span-2">
            <span>העלאת קבלה {Number(formData.refreshmentsCost) > 0 && <em>(חובה כשיש הוצאות כיבוד)</em>}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleReceiptChange}
            />
          </label>
        </div>

        {receipt && <p className="rf-note">נבחר קובץ חדש: {receipt.name}</p>}

        {isEditing && !receipt && initialData.receipt?.fileName && (
          <p className="rf-note">
            קבלה קיימת: {initialData.receipt.fileName} (השאירי ללא שינוי כדי לשמור אותה)
          </p>
        )}
      </fieldset>

      <div className="rf-actions">
        <button type="submit" className="hp-btn hp-btn-purple">
          {isEditing ? "שמירת שינויים" : "שליחת דיווח"}
        </button>

        <button type="button" className="hp-btn hp-btn-outline" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </form>
  );
}

export default ReportForm;
