// Background service worker (Manifest V3)

const STORAGE_KEYS = {
  lastPageData: 'lastPageData',
  settings: 'settings',
};

chrome.runtime.onInstalled.addListener(async () => {
  // Initialize default settings
  const existing = await chrome.storage.sync.get(STORAGE_KEYS.settings);
  if (!existing[STORAGE_KEYS.settings]) {
    await chrome.storage.sync.set({ [STORAGE_KEYS.settings]: { autoScrapeOnOpen: true } });
  }

  // Example: daily reminder alarm at 9am local
  try {
    chrome.alarms.create('daily-summary', { when: Date.now() + 10_000, periodInMinutes: 24 * 60 });
  } catch (err) {
    // Some environments may not allow alarms
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'daily-summary') {
    const { [STORAGE_KEYS.lastPageData]: lastPageData } = await chrome.storage.local.get(STORAGE_KEYS.lastPageData);
    if (lastPageData) {
      try {
        const creation = chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon128.png',
          title: 'Turo Fleet Manager',
          message: `Daily summary ready from ${new URL(lastPageData.url).hostname}`,
        });
        // In MV3, some Chrome APIs return Promises when no callback is provided.
        // Await to catch rejections like missing icon resources.
        if (creation && typeof creation.then === 'function') {
          await creation;
        }
      } catch (_) {
        // Notifications may fail if icon missing; it's optional in dev
      }
    }
  }
});

// Message routing and storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  switch (message.type) {
    case 'TURO_PAGE_DATA': {
      chrome.storage.local.set({ [STORAGE_KEYS.lastPageData]: message.payload });
      sendResponse?.({ ok: true });
      break;
    }
    case 'GET_LAST_PAGE_DATA': {
      chrome.storage.local.get(STORAGE_KEYS.lastPageData).then((result) => {
        sendResponse?.({ ok: true, data: result[STORAGE_KEYS.lastPageData] || null });
      });
      // Keep channel open for async response
      return true;
    }
    default:
      break;
  }
});


