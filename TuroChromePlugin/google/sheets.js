import { getValidAccessToken } from '../auth/google.js';

const SHEETS_API = 'https://sheets.googleapis.com/v4';

async function sheetsRequest(path, { method = 'GET', query = {}, body } = {}) {
  const accessToken = await getValidAccessToken();
  const url = new URL(`${SHEETS_API}${path}`);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API ${method} ${url.pathname}: ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function createSpreadsheet(title = 'Reservations') {
  const json = await sheetsRequest('/spreadsheets', {
    method: 'POST',
    body: {
      properties: { title },
      sheets: [{ properties: { title } }],
    },
  });
  return { spreadsheetId: json.spreadsheetId, url: json.spreadsheetUrl, title };
}

export async function ensureHeaders(spreadsheetId, sheetTitle = 'Reservations') {
  const header = ['ReservationId', 'GuestName', 'Vehicle', 'Start', 'End', 'Status', 'Payout', 'Notes'];
  const range = `${sheetTitle}!A1:H1`;
  // Try update values; if the sheet doesn't exist, create it
  const doUpdate = async () => sheetsRequest(`/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
    method: 'PUT',
    query: { valueInputOption: 'RAW' },
    body: { range, majorDimension: 'ROWS', values: [header] },
  });
  try {
    await doUpdate();
    return true;
  } catch (err) {
    // Try to add sheet then re-run update
    await sheetsRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
    });
    await doUpdate();
    return true;
  }
}


