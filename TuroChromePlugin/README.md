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

Setup (Google OAuth)
--------------------
1. Copy `auth/config.example.js` to `auth/config.js` and set your Client ID.
2. In Google Cloud Console, create an OAuth client (Web application) and add redirect URI: `https://<EXTENSION_ID>.chromiumapp.org/`.
3. Add your account as a Test user on the OAuth consent screen (Testing mode).
4. Enable Drive API and Sheets API for your project.
5. Do not commit `auth/config.js`. It is ignored by `.gitignore`.

Notes
-----
- The DOM selectors in `content/content.js` are heuristics and may need adjustment as Turo changes its UI.
- No icons are included; for notifications, add `icon16.png`, `icon48.png`, and `icon128.png` to the root and reference them in `manifest.json` if desired.
- This scaffold uses plain JS and no bundler to keep things simple.

Troubleshooting
---------------
See `TROUBLESHOOTING.md` for common issues (content script access, missing icons, Google OAuth errors) and fixes.

Next steps
----------
- Harden selectors per the exact Turo host pages you use most.
- Add export (CSV/JSON) and a richer popup UI (filters, totals, reminders).
- Track maintenance, cleaning reminders, and pricing adjustments via the background script.


