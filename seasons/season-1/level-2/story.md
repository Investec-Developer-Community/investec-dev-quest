# Token Trouble

## Mission Brief

**The Briefing Desk:** Overnight jobs for a Cape Town SME dashboard are hammering auth. Every account request asks for a new bearer token, even though tokens can be reused until expiry.

FinFlow needs a client that reuses tokens, refreshes only when needed, and never spins forever.

## Bug Report

The starter fetches a new OAuth token before every request. That ignores token lifetime and still needs bounded recovery when a token expires.

## Your Task

Edit `solution.js` and implement:

```js
export async function getToken(clientId, clientSecret)
export async function apiFetch(url, tokenStore)
```

Rules:

- `getToken` uses OAuth2 client credentials from arguments and API key from `process.env`.
- `apiFetch` reuses `tokenStore.token` while valid.
- Use `expires_in` from the token response to maintain `tokenStore.expiresAt`.
- If there is no token or the cached token expired, fetch one token.
- On the first `401`, refresh the token, update the store, and retry once.
- On a second `401`, throw `Error('Token refresh failed')`.
- For other non-OK responses, throw `Error('Request failed: <status>')`.

## Threat

**The Red Team:** Token Treadmill watches for clients that hit OAuth on every request instead of reusing the bearer token.

## Win Condition

Behavior tests and the Red Team pass when requests reuse one token, expiry triggers one refresh, and retry loops stay bounded.
