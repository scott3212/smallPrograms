const statusEl = document.getElementById('status');
const contentEl = document.getElementById('content');
const refreshBtn = document.getElementById('refreshBtn');
const openOptions = document.getElementById('openOptions');

function setStatus(text) {
  statusEl.textContent = text;
}

function renderData(data) {
  contentEl.innerHTML = '';
  if (!data) {
    contentEl.innerHTML = '<div class="muted">No data yet. Navigate to a Turo page and click Refresh.</div>';
    return;
  }

  const header = document.createElement('div');
  header.className = 'card';
  header.innerHTML = `<div><strong>${data.type}</strong></div><div class="muted">${new URL(data.url).pathname}</div>`;
  contentEl.appendChild(header);

  (data.items || []).slice(0, 10).forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = JSON.stringify(item);
    contentEl.appendChild(card);
  });
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function requestScrapeFromActiveTab() {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) {
      setStatus('No active tab');
      return null;
    }
    setStatus('Requesting data from page...');
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'REQUEST_PAGE_DATA' });
    if (response?.ok) {
      setStatus('Received data');
      renderData(response.data);
      // Persist via background for history
      chrome.runtime.sendMessage({ type: 'TURO_PAGE_DATA', payload: response.data });
      return response.data;
    }
    setStatus('Failed to get data');
    return null;
  } catch (err) {
    // If content script isn't injected (non-matching page), fall back to last stored
    setStatus('Content script not available on this page. Showing last known data.');
    const last = await chrome.runtime.sendMessage({ type: 'GET_LAST_PAGE_DATA' });
    renderData(last?.data || null);
    return last?.data || null;
  }
}

async function loadLastData() {
  const result = await chrome.runtime.sendMessage({ type: 'GET_LAST_PAGE_DATA' });
  renderData(result?.data || null);
}

refreshBtn.addEventListener('click', requestScrapeFromActiveTab);
openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

loadLastData();


