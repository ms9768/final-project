
import { useEffect, useState } from "react";

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
}

function ReportForm({
  groups,
  onSubmit,
  onCancel,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    groupId: "",
    meetingDate: "",
    topic: "",
    participantCount: "",
    refreshmentsCost: "",
  });

  const [receipt, setReceipt] = useState(null);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        groupId:
          initialData.groupId?._id ||
          initialData.groupId ||
          "",
        meetingDate: formatDateForInput(
          initialData.meetingDate
        ),
        topic: initialData.topic || "",
        participantCount: initialData.participantCount ?? "",
        refreshmentsCost: initialData.refreshmentsCost ?? "",
      });
    } else {
      setFormData({
        groupId: "",
        meetingDate: "",
        topic: "",
        participantCount: "",
        refreshmentsCost: "",
      });
    }

    setReceipt(null);
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleReceiptChange(event) {
    const selectedFile = event.target.files[0];
    setReceipt(selectedFile || null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const reportData = {
      ...formData,
      participantCount: Number(formData.participantCount),
      refreshmentsCost: Number(formData.refreshmentsCost),
    };

    onSubmit(reportData, receipt);
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2>
        {isEditing ? "עריכת דיווח פגישה" : "דיווח על פגישה"}
      </h2>

      <label>קבוצה</label>
      <select
        name="groupId"
        value={formData.groupId}
        onChange={handleChange}
        required
      >
        <option value="">בחר קבוצה</option>

        {groups.map((group) => (
          <option key={group._id} value={group._id}>
            {group.name}
          </option>
        ))}
      </select>

      <label>תאריך הפגישה</label>
      <input
        type="datetime-local"
        name="meetingDate"
        value={formData.meetingDate}
        onChange={handleChange}
        required
      />

      <label>נושא הפגישה</label>
      <input
        type="text"
        name="topic"
        value={formData.topic}
        onChange={handleChange}
        required
      />

      <label>מספר משתתפים</label>
      <input
        type="number"
        name="participantCount"
        min="0"
        value={formData.participantCount}
        onChange={handleChange}
        required
      />

      <label>עלות כיבוד (₪)</label>
      <input
        type="number"
        name="refreshmentsCost"
        min="0"
        value={formData.refreshmentsCost}
        onChange={handleChange}
        required
      />

      <label>העלאת קבלה</label>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleReceiptChange}
      />

      {receipt && (
        <p>נבחר קובץ חדש: {receipt.name}</p>
      )}

      {isEditing && !receipt && initialData.receipt?.fileName && (
        <p>
          קבלה קיימת: {initialData.receipt.fileName}
          (השאר ללא שינוי כדי לשמור אותה)
        </p>
      )}

      <button type="submit">
        {isEditing ? "שמירת שינויים" : "שליחת דיווח"}
      </button>

      <button type="button" onClick={onCancel}>
        ביטול
      </button>
    </form>
  );
}

export default ReportForm;
