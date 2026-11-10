
import { useState } from "react";

function CoordinatorActions({ report, onUpdateStatus }) {
  const [coordinatorNotes, setCoordinatorNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  function handleCorrectionRequest() {
    if (!coordinatorNotes.trim()) {
      alert("יש לכתוב מה צריך לתקן לפני שליחת הבקשה");
      return;
    }

    onUpdateStatus(
      report._id,
      "needs_correction",
      coordinatorNotes
    );
  }

  return (
    <div className="coordinator-actions">
      <div className="coordinator-buttons">
        <button
          className="approve-button"
          onClick={() =>
            onUpdateStatus(report._id, "approved", "")
          }
        >
          אישור
        </button>

        <button
          className="reject-button"
          onClick={() =>
            onUpdateStatus(report._id, "rejected", "")
          }
        >
          דחייה
        </button>

        <button
          className="correction-button"
          onClick={() => setShowNotes(!showNotes)}
        >
          בקשת תיקון
        </button>
      </div>

      {showNotes && (
        <div className="coordinator-notes-form">
          <textarea
            value={coordinatorNotes}
            onChange={(event) =>
              setCoordinatorNotes(event.target.value)
            }
            placeholder="כתוב מה צריך לתקן בדיווח..."
            rows={3}
          />

          <button
            className="send-correction-button"
            onClick={handleCorrectionRequest}
          >
            שליחת בקשת תיקון
          </button>
        </div>
      )}
    </div>
  );
}

export default CoordinatorActions;
