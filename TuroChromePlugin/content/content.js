// Content script injected on Turo pages

function detectPageType(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (path.includes('/host') && path.includes('vehicles')) return 'host-vehicles';
  if (path.includes('/host') && path.includes('trips')) return 'host-trips';
  if (path.includes('/host') && path.includes('earnings')) return 'host-earnings';
  if (path.includes('/cars/')) return 'listing';
  return 'generic';
}

function scrapePage() {
  const url = location.href;
  const type = detectPageType(url);

  const data = { title: document.title, url, type, timestamp: Date.now(), items: [] };

  try {
    if (type === 'host-vehicles') {
      // Heuristic selectors; adjust as needed for Turo DOM
      const cards = document.querySelectorAll('[data-test-id*="vehicle"], [class*="vehicle" i]');
      data.items = Array.from(cards).slice(0, 50).map((card) => {
        const name = card.querySelector('h2, h3, [data-test-id*="name"]')?.textContent?.trim() || '';
        const plate = card.querySelector('[data-test-id*="plate"], [class*="plate" i]')?.textContent?.trim() || '';
        const status = card.querySelector('[data-test-id*="status"], [class*="status" i]')?.textContent?.trim() || '';
        return { name, plate, status };
      });
    } else if (type === 'host-trips') {
      const rows = document.querySelectorAll('[data-test-id*="trip"], [class*="trip" i]');
      data.items = Array.from(rows).slice(0, 50).map((row) => {
        const guest = row.querySelector('[data-test-id*="guest"], [class*="guest" i]')?.textContent?.trim() || '';
        const dates = row.querySelector('[data-test-id*="date"], time')?.textContent?.trim() || '';
        const vehicle = row.querySelector('[data-test-id*="vehicle"], [class*="vehicle" i]')?.textContent?.trim() || '';
        return { guest, dates, vehicle };
      });
    } else if (type === 'host-earnings') {
      const numbers = document.querySelectorAll('strong, [data-test-id*="amount"]');
      const total = Array.from(numbers).map((el) => el.textContent || '').find((t) => /\$[\d,.]+/.test(t)) || '';
      data.items = [{ total }];
    } else if (type === 'listing') {
      const title = document.querySelector('h1')?.textContent?.trim() || '';
      const price = document.querySelector('[data-test-id*="price"], [class*="price" i]')?.textContent?.trim() || '';
      data.items = [{ title, price }];
    }
  } catch (err) {
    // Fail soft; provide minimal info
  }

  return data;
}

function pushLatestToBackground() {
  const payload = scrapePage();
  chrome.runtime.sendMessage({ type: 'TURO_PAGE_DATA', payload });
}

// Respond to popup requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'REQUEST_PAGE_DATA') {
    try {
      const data = scrapePage();
      sendResponse({ ok: true, data });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
    return true; // allow async if needed later
  }
});

// Auto-push when DOM stabilizes
const observer = new MutationObserver(() => {
  // Debounce by scheduling at next microtask
  clearTimeout(observer._t);
  observer._t = setTimeout(pushLatestToBackground, 400);
});

observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true });

// Initial send after load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  pushLatestToBackground();
} else {
  window.addEventListener('DOMContentLoaded', pushLatestToBackground, { once: true });
}


