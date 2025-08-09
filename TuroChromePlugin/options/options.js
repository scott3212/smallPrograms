const STORAGE_KEY = 'settings';
const checkbox = document.getElementById('autoScrapeOnOpen');
const statusEl = document.getElementById('status');

async function load() {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const settings = result[STORAGE_KEY] || { autoScrapeOnOpen: true };
  checkbox.checked = !!settings.autoScrapeOnOpen;
}

async function save() {
  const settings = { autoScrapeOnOpen: checkbox.checked };
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
  statusEl.textContent = 'Saved';
  setTimeout(() => (statusEl.textContent = ''), 1200);
}

checkbox.addEventListener('change', save);
load();


