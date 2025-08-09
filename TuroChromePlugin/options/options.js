import { getAuthState, signInInteractive, signOut } from '../auth/google.js';
import { ensureFolder, findSpreadsheetInFolderByName, moveFileToFolder } from '../google/drive.js';
import { createSpreadsheet, ensureHeaders } from '../google/sheets.js';

const STORAGE_KEY = 'settings';
const FOUNDATION_KEY = 'foundation';

const checkbox = document.getElementById('autoScrapeOnOpen');
const statusEl = document.getElementById('status');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authStateEl = document.getElementById('authState');

const foundationBtn = document.getElementById('foundationBtn');
const foundationStatusEl = document.getElementById('foundationStatus');
const linksEl = document.getElementById('links');

async function loadSettings() {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const settings = result[STORAGE_KEY] || { autoScrapeOnOpen: true };
  checkbox.checked = !!settings.autoScrapeOnOpen;
}

async function saveSettings() {
  const settings = { autoScrapeOnOpen: checkbox.checked };
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
  statusEl.textContent = 'Saved';
  setTimeout(() => (statusEl.textContent = ''), 1200);
}

checkbox.addEventListener('change', saveSettings);

async function refreshAuthState() {
  const state = await getAuthState();
  if (!state.signedIn) {
    authStateEl.textContent = 'Signed out';
  } else {
    authStateEl.textContent = `Signed in · expires in ${state.expiresInSeconds}s`;
  }
}

signInBtn.addEventListener('click', async () => {
  try {
    authStateEl.textContent = 'Signing in...';
    await signInInteractive();
  } catch (e) {
    authStateEl.textContent = `Sign-in failed: ${String(e.message || e)}`;
    return;
  }
  await refreshAuthState();
});

signOutBtn.addEventListener('click', async () => {
  await signOut();
  await refreshAuthState();
});

function renderLinks({ folderId, spreadsheetId, spreadsheetUrl }) {
  linksEl.innerHTML = '';
  if (folderId) {
    const a = document.createElement('a');
    a.href = `https://drive.google.com/drive/folders/${folderId}`;
    a.textContent = 'Open Turo folder';
    a.target = '_blank';
    linksEl.appendChild(a);
  }
  if (spreadsheetId) {
    const a = document.createElement('a');
    a.href = spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    a.textContent = 'Open Reservations spreadsheet';
    a.target = '_blank';
    linksEl.appendChild(a);
  }
}

async function loadFoundationState() {
  const result = await chrome.storage.sync.get(FOUNDATION_KEY);
  const foundation = result[FOUNDATION_KEY] || {};
  renderLinks(foundation);
}

foundationBtn.addEventListener('click', async () => {
  try {
    foundationStatusEl.textContent = 'Creating/ensuring folder and sheet...';
    const folder = await ensureFolder('Turo');
    // Check spreadsheet in folder
    let sheet = await findSpreadsheetInFolderByName(folder.id, 'Reservations');
    if (!sheet) {
      const created = await createSpreadsheet('Reservations');
      await moveFileToFolder(created.spreadsheetId, folder.id);
      await ensureHeaders(created.spreadsheetId, 'Reservations');
      sheet = { id: created.spreadsheetId, url: created.url };
    } else {
      await ensureHeaders(sheet.id, 'Reservations');
    }
    const foundation = { folderId: folder.id, spreadsheetId: sheet.id, spreadsheetUrl: sheet.url };
    await chrome.storage.sync.set({ [FOUNDATION_KEY]: foundation });
    renderLinks(foundation);
    foundationStatusEl.textContent = 'Done';
    setTimeout(() => (foundationStatusEl.textContent = ''), 1500);
  } catch (e) {
    foundationStatusEl.textContent = `Error: ${String(e.message || e)}`;
  }
});

await loadSettings();
await refreshAuthState();
await loadFoundationState();



