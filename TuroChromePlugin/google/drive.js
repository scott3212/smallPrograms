import { getValidAccessToken } from '../auth/google.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';

async function driveRequest(path, { method = 'GET', query = {}, body } = {}) {
  const accessToken = await getValidAccessToken();
  const url = new URL(`${DRIVE_API}${path}`);
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
    throw new Error(`Drive API ${method} ${url.pathname}: ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function findFolderByName(name) {
  const q = `name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const json = await driveRequest('/files', { query: { q, fields: 'files(id, name)' } });
  return json.files?.[0] || null;
}

export async function ensureFolder(name) {
  const existing = await findFolderByName(name);
  if (existing) return existing;
  const created = await driveRequest('/files', {
    method: 'POST',
    body: { name, mimeType: 'application/vnd.google-apps.folder' },
  });
  return created; // { id, name }
}

export async function findSpreadsheetInFolderByName(folderId, name) {
  const q = `name = '${name.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${folderId}' in parents and trashed = false`;
  const json = await driveRequest('/files', { query: { q, fields: 'files(id, name)' } });
  return json.files?.[0] || null;
}

export async function moveFileToFolder(fileId, folderId) {
  // Get existing parents
  const file = await driveRequest(`/files/${fileId}`, { query: { fields: 'parents' } });
  const previousParents = (file.parents || []).join(',');
  const json = await driveRequest(`/files/${fileId}`, {
    method: 'PATCH',
    query: { addParents: folderId, removeParents: previousParents },
  });
  return json;
}


