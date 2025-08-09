import { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_SCOPES, TOKEN_EXPIRY_BUFFER_SECONDS } from './config.js';

const SESSION_KEY = 'google_oauth_token';

function getRedirectUri() {
  return `https://${chrome.runtime.id}.chromiumapp.org/`;
}

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    response_type: 'token',
    redirect_uri: getRedirectUri(),
    scope: GOOGLE_OAUTH_SCOPES,
    include_granted_scopes: 'true',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function parseFragment(fragment) {
  const params = new URLSearchParams(fragment.startsWith('#') ? fragment.slice(1) : fragment);
  const accessToken = params.get('access_token');
  const tokenType = params.get('token_type');
  const expiresIn = Number(params.get('expires_in') || 0);
  const scope = params.get('scope');
  return { accessToken, tokenType, expiresIn, scope };
}

async function saveToken(token) {
  const store = chrome.storage.session ?? chrome.storage.local;
  await store.set({ [SESSION_KEY]: token });
}

async function getStoredToken() {
  const store = chrome.storage.session ?? chrome.storage.local;
  const result = await store.get(SESSION_KEY);
  return result?.[SESSION_KEY] || null;
}

export async function signInInteractive() {
  const authUrl = buildAuthUrl();
  const redirectUrl = await chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true });
  const { accessToken, tokenType, expiresIn, scope } = parseFragment(new URL(redirectUrl).hash);
  if (!accessToken) throw new Error('No access token obtained');
  const expiresAt = Date.now() + (expiresIn * 1000);
  const token = { accessToken, tokenType, scope, expiresAt };
  await saveToken(token);
  return token;
}

export async function getValidAccessToken({ interactiveIfNeeded = true } = {}) {
  const token = await getStoredToken();
  const now = Date.now();
  if (token && token.expiresAt - TOKEN_EXPIRY_BUFFER_SECONDS * 1000 > now) {
    return token.accessToken;
  }
  if (!interactiveIfNeeded) return null;
  const fresh = await signInInteractive();
  return fresh.accessToken;
}

export async function signOut() {
  const token = await getStoredToken();
  const store = chrome.storage.session ?? chrome.storage.local;
  await store.remove(SESSION_KEY);
  if (token?.accessToken) {
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: token.accessToken }),
      });
    } catch (_) {
      // Ignore revoke errors
    }
  }
}

export async function getAuthState() {
  const token = await getStoredToken();
  if (!token) return { signedIn: false };
  return {
    signedIn: true,
    expiresAt: token.expiresAt,
    expiresInSeconds: Math.max(0, Math.floor((token.expiresAt - Date.now()) / 1000)),
    scopes: token.scope?.split(' ') ?? [],
  };
}


