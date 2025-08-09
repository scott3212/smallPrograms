## Troubleshooting

This guide covers common issues encountered while developing and testing the Turo Fleet Manager Chrome extension and how to resolve them quickly.

### 1) Popup says: “Content script not available on this page. Showing last known data.”

**Symptoms**
- Popup shows the message above even when you are on a `turo.com` page (e.g., `/ca/en/trips/calendar`).
- Clicking Refresh doesn’t pull new data.

**Cause**
- Chrome didn’t inject the content script because site access was withheld, or messaging failed.

**What the extension expects**
```30:35:manifest.json
"content_scripts": [
  {
    "matches": ["https://turo.com/*", "https://*.turo.com/*"],
    "js": ["content/content.js"],
    "run_at": "document_idle"
  }
]
```

**Fixes**
- In `chrome://extensions` → Turo Fleet Manager → Site access: allow on all `turo.com` sites.
- Ensure the active tab is actually on `https://turo.com/...` (not inside an iframe or PDF).
- Reload the extension and the page.
- The popup now auto-injects `content/content.js` and retries when messaging initially fails:
```35:59:popup/popup.js
// on messaging error, inject and retry
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ['content/content.js'],
});
```

Notes: The calendar URL is treated as `generic` by `detectPageType`, but it will still return basic info unless you add specific scraping for that route.

### 2) Console error: “Unable to download all specified images.”

**Symptoms**
- An unhandled error appears from notification creation.

**Cause**
- A notification is created with `iconUrl: 'icon128.png'` but the icon was missing.

**Fixes**
- Provide `icon16.png`, `icon48.png`, and `icon128.png` at the project root and declare them in the manifest:
```6:13:manifest.json
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
},
```
- We also wrapped notification creation in a try/catch and await to avoid unhandled rejections:
```24:38:background.js
const creation = chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icon128.png',
  title: 'Turo Fleet Manager',
  message: `Daily summary ready from ${new URL(lastPageData.url).hostname}`,
});
if (creation && typeof creation.then === 'function') {
  await creation;
}
```
- Alternatively, remove `iconUrl` if you don’t want an icon.

### 3) Google OAuth Error 400: redirect_uri_mismatch

**Symptoms**
- Sign-in flow shows: `redirect_uri_mismatch`.

**Cause**
- The authorized redirect URI in Google Cloud doesn’t match the extension’s redirect URI.

**What the extension uses**
```5:7:auth/google.js
function getRedirectUri() {
  return `https://${chrome.runtime.id}.chromiumapp.org/`;
}
```

**Fixes**
- In Google Cloud Console → APIs & Services → Credentials:
  - Create OAuth client (type: Web application).
  - Add Authorized redirect URI exactly as: `https://<EXTENSION_ID>.chromiumapp.org/` (include trailing slash).
- Update `auth/config.js` with your Client ID.
- Reload the extension. Confirm the ID in `chrome://extensions` matches the one in the URI.

### 4) Google OAuth Error 403: access_denied (app not verified / testers only)

**Symptoms**
- Error indicates the app is being tested and only developer-approved testers can access.

**Cause**
- OAuth consent screen is in Testing and your account is not a test user, or User type is Internal and your account isn’t in that Workspace.

**Fixes**
- Google Cloud Console → OAuth consent screen:
  - Set User Type to External.
  - Add your Google account under Test users.
- Ensure APIs are enabled: Google Drive API and Google Sheets API.
- Retry sign-in with the same tester account. Allow a few minutes for propagation.

**Production note**
- For general availability, provide app domain details (homepage, privacy policy) and submit for verification (required for Drive/Sheets scopes).

### 5) “No data yet” in popup

**Symptoms**
- Popup shows “No data yet. Navigate to a Turo page and click Refresh.”

**Causes and fixes**
- Not on a supported page or first run: navigate to a `turo.com` page and click Refresh.
- If still empty, open DevTools on the page and check for DOM changes; adjust selectors in `content/content.js` as needed.

### Reference: Files involved
- `manifest.json`: host permissions, content scripts, and icons.
- `content/content.js`: page detection and scraping.
- `popup/popup.js`: requests page data and renders it; now injects content script on demand.
- `background.js`: stores last page data and creates optional notifications.
- `auth/*`: Google OAuth and token management; Drive/Sheets helpers under `google/*`.


