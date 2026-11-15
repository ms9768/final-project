
import { API_BASE_URL } from "./apiConfig";

const API_URL = `${API_BASE_URL}/api/meeting-reports`;
const GROUPS_URL = `${API_BASE_URL}/api/groups`;

// הוספת אסימון ההתחברות לכותרות הבקשה
function getAuthHeaders(extraHeaders = {}) {
  const token = sessionStorage.getItem("authToken");

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

// פונקציה מרכזית לטיפול בתשובות מהשרת
async function handleResponse(response, defaultMessage) {
  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || defaultMessage);
  }

  return data;
}

// קבלת כל הדיווחים
export async function getReports() {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(
    response,
    "שגיאה בטעינת הדיווחים"
  );
}

// קבלת הקבוצות של מנחה לפי מזהה
export async function getGroups(lecturerId) {
  const response = await fetch(
    `${GROUPS_URL}/lecturer/${lecturerId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "שגיאה בטעינת הקבוצות"
  );
}

// יצירת דיווח חדש
export async function createReport(reportData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(reportData),
  });

  return await handleResponse(
    response,
    "שגיאה ביצירת הדיווח"
  );
}

// עדכון דיווח קיים
export async function updateReport(reportId, reportData) {
  const response = await fetch(`${API_URL}/${reportId}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(reportData),
  });

  return await handleResponse(
    response,
    "שגיאה בעדכון הדיווח"
  );
}

// עדכון סטטוס דיווח
export async function updateReportStatus(
  reportId,
  status,
  coordinatorNotes
) {
  const response = await fetch(
    `${API_URL}/${reportId}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        status,
        coordinatorNotes,
      }),
    }
  );

  return await handleResponse(
    response,
    "שגיאה בעדכון סטטוס הדיווח"
  );
}

// העלאת קבלה
export async function uploadReceipt(reportId, file) {
  const formData = new FormData();

  formData.append("receipt", file);

  const response = await fetch(
    `${API_URL}/${reportId}/receipt`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    }
  );

  return await handleResponse(
    response,
    "שגיאה בהעלאת הקבלה"
  );
}

// קבלת סיכום התשלום של מנחה מסוימת
export async function getLecturerPayment(lecturerId) {
  const response = await fetch(
    `${API_URL}/lecturer/${lecturerId}/payment`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "שגיאה בטעינת נתוני התשלום"
  );
}

// קבלת סיכום התשלומים של כל המנחות
export async function getAllLecturersPayments() {
  const response = await fetch(
    `${API_URL}/lecturers/payments`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "שגיאה בטעינת התשלומים של המנחות"
  );
}

// קבלת דיווח מלא לפי מזהה
export async function getReportById(reportId) {
  const response = await fetch(`${API_URL}/${reportId}`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(
    response,
    "שגיאה בטעינת פרטי הדיווח"
  );
}
