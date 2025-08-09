Turo Fleet Manager (Chrome Extension)
====================================

Quick-start Manifest V3 extension scaffold to help manage your Turo fleet by scraping relevant data from host pages into a simple popup.

Features (alpha)
----------------
- Scrapes basic info from Turo host pages (vehicles, trips, earnings, and listing details)
- Popup to request fresh data from the active tab and view the last collected snapshot
- Background service worker persists the last page data and sets up a sample daily reminder
- Options page for a simple setting (auto-scrape toggle)

How to run locally
------------------
1. Open Chrome → go to `chrome://extensions/`.
2. Enable "Developer mode" (top-right toggle).
3. Click "Load unpacked" and select this folder.
4. Navigate to a Turo page (e.g., your host dashboard) and click the extension icon to open the popup.
5. Click "Refresh" to request a scrape from the current page.

Notes
-----
- The DOM selectors in `content/content.js` are heuristics and may need adjustment as Turo changes its UI.
- No icons are included; for notifications, add `icon16.png`, `icon48.png`, and `icon128.png` to the root and reference them in `manifest.json` if desired.
- This scaffold uses plain JS and no bundler to keep things simple.

Next steps
----------
- Harden selectors per the exact Turo host pages you use most.
- Add export (CSV/JSON) and a richer popup UI (filters, totals, reminders).
- Track maintenance, cleaning reminders, and pricing adjustments via the background script.


