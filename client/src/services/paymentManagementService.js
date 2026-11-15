import { API_BASE_URL } from "./apiConfig";

const API_URL = `${API_BASE_URL}/api/payment-management`;

function getAuthHeaders(extraHeaders = {}) {
  return {
    ...extraHeaders,
    Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
  };
}

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new Error(data?.message || defaultMessage);
  }

  return response;
}

export async function getPaymentFacilitators() {
  const response = await fetch(`${API_URL}/facilitators`, {
    headers: getAuthHeaders(),
  });
  await handleResponse(response, "שגיאה בטעינת רשימת המנחות");
  return response.json();
}

export async function getPaymentReports(filters) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(
    `${API_URL}/reports${query.toString() ? `?${query}` : ""}`,
    { headers: getAuthHeaders() }
  );
  await handleResponse(response, "שגיאה בטעינת הדיווחים לתשלום");
  return response.json();
}

export async function markPaymentReportPaid(reportId) {
  const response = await fetch(`${API_URL}/reports/${reportId}/paid`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  await handleResponse(response, "לא ניתן לסמן את הדיווח כשולם");
  return response.json();
}

export async function exportPaymentWorkbook(filters) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const response = await fetch(`${API_URL}/export?${query}`, {
    headers: getAuthHeaders(),
  });
  await handleResponse(response, "לא ניתן להפיק את קובץ התשלומים");

  const workbook = await response.blob();
  const objectUrl = URL.createObjectURL(workbook);
  const download = document.createElement("a");
  download.href = objectUrl;
  download.download = getWorkbookFilename(filters);
  document.body.appendChild(download);
  download.click();
  download.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

function getWorkbookFilename({ fromDate, toDate }) {
  if (fromDate && toDate && fromDate.slice(0, 7) === toDate.slice(0, 7)) {
    const [year, month] = fromDate.split("-").map(Number);
    const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(
      "en-US",
      { month: "long", timeZone: "UTC" }
    );
    return `Facilitator_Payments_${monthName}_${year}.xlsx`;
  }

  if (fromDate && toDate) {
    return `Facilitator_Payments_${fromDate}_to_${toDate}.xlsx`;
  }
  if (fromDate) return `Facilitator_Payments_From_${fromDate}.xlsx`;
  if (toDate) return `Facilitator_Payments_Through_${toDate}.xlsx`;

  return "Facilitator_Payments_All_Periods.xlsx";
}
