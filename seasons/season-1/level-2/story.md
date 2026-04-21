# Token Trouble

## The situation

FinFlow's API client has been running in production for a week. Everything looks fine during business hours — but every morning the support team finds a wave of errors in the overnight logs:

```
Error: Request failed with status 401
  at fetchAccounts (client.js:24)
  ...
```

After some digging, you find the root cause: **OAuth2 access tokens expire after 30 minutes**. The client fetches a token at startup and uses it forever. When it expires, every API call fails with `401 Unauthorized`.

## Your task

Fix the `apiFetch` function so it **automatically retries** with a fresh token when it receives a `401`.

The retry must happen **exactly once** — if a fresh token also gets a 401, propagate the error. Don't retry indefinitely.

### Exports required

```js
// Fetch a new access token using client credentials
export async function getToken(clientId, clientSecret)

// Make an authenticated API call. If 401, refresh token once and retry.
export async function apiFetch(url, tokenStore)
```

The `tokenStore` object is a simple mutable container for the current token:
```js
{ token: '<current access token>' }
```

After a successful refresh, update `tokenStore.token` with the new value so callers can observe it.

### Rules

- Credentials must come from `process.env` — never hardcode them
- On first `401`: call `getToken`, update `tokenStore.token`, retry the request once
- On second `401`: throw `Error('Token refresh failed')`
- Any non-401 non-ok response: throw `Error('Request failed: <status>')`

## Win condition

Both the behavior tests and the attack script must pass.

The attack will call a protected endpoint with an intentionally **stale token**, then check that `apiFetch` transparently recovers and returns the data without the caller needing to handle the refresh manually.
