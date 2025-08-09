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

function toColumnLetter(columnIndexZeroBased) {
  let n = columnIndexZeroBased + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function a1HeaderRange(sheetTitle, headerLength) {
  const endCol = toColumnLetter(headerLength - 1);
  return `${sheetTitle}!A1:${endCol}1`;
}

async function getSheetId(spreadsheetId, sheetTitle) {
  const meta = await sheetsRequest(`/spreadsheets/${spreadsheetId}`, {
    query: { fields: 'sheets(properties(sheetId,title))' },
  });
  const sheet = (meta.sheets || []).map((s) => s.properties).find((p) => p.title === sheetTitle);
  return sheet ? sheet.sheetId : null;
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
  // Standardized, explicit headers in PascalCase
  const headers = [
    'ReservationId',
    'GuestName',
    'Vehicle',
    'Start',
    'End',
    'Status',
    'Payout',
    'PayoutPerDay',
    'ReviewForGuest',
    'NoteForGuest',
    'ReviewToMe',
    'ReviewLink',
    'RepeatGuest',
  ];
  const headerRange = a1HeaderRange(sheetTitle, headers.length);

  const putHeaders = async () => sheetsRequest(`/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}`, {
    method: 'PUT',
    query: { valueInputOption: 'RAW' },
    body: { range: headerRange, majorDimension: 'ROWS', values: [headers] },
  });

  let createdSheetId = null;
  try {
    await putHeaders();
  } catch (err) {
    // Create sheet and retry
    const addResp = await sheetsRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
    });
    try {
      createdSheetId = addResp?.replies?.[0]?.addSheet?.properties?.sheetId ?? null;
    } catch (_) {
      createdSheetId = null;
    }
    await putHeaders();
  }

  // Determine the sheetId for further formatting (filters, validation)
  const sheetId = createdSheetId ?? (await getSheetId(spreadsheetId, sheetTitle));
  if (sheetId == null) return true; // headers are set; nothing else we can do

  const reviewForGuestColIndex = headers.indexOf('ReviewForGuest');

  const requests = [];

  // Set a basic filter across all header columns
  requests.push({
    setBasicFilter: {
      filter: {
        range: {
          sheetId,
          startRowIndex: 0,
          startColumnIndex: 0,
          endColumnIndex: headers.length,
        },
      },
    },
  });

  // Optional: freeze header row for better UX
  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // Set data validation (dropdown) for ReviewForGuest column, rows 2..end
  if (reviewForGuestColIndex >= 0) {
    requests.push({
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: 1,
          startColumnIndex: reviewForGuestColIndex,
          endColumnIndex: reviewForGuestColIndex + 1,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: 'Great' },
              { userEnteredValue: 'Good' },
              { userEnteredValue: 'Average' },
              { userEnteredValue: 'Bad' },
            ],
          },
          strict: false,
          showCustomUi: true,
        },
      },
    });
  }

  await sheetsRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: { requests },
  });

  return true;
}


