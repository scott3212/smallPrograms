// Replace with your OAuth 2.0 Client ID from Google Cloud Console
// Type: Web application; add redirect URI: https://<EXTENSION_ID>.chromiumapp.org/
export const GOOGLE_OAUTH_CLIENT_ID = 'REPLACE_WITH_YOUR_CLIENT_ID.apps.googleusercontent.com';

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');

// Buffer (seconds) before expiry when we consider the token invalid
export const TOKEN_EXPIRY_BUFFER_SECONDS = 60;


