# Token Trouble

## Mission Brief

**The Briefing Desk:** Overnight jobs for a Cape Town SME dashboard are waking up to `401 Unauthorized` errors. The first token works, then stale credentials turn a quiet batch run into a support queue.

FinFlow needs a client that refreshes once, recovers cleanly, and never spins forever.

## Bug Report

The starter performs authenticated requests but treats every non-OK response the same. A stale token kills the call instead of triggering a bounded refresh.

## Your Task

Edit `solution.js` and implement:

```js
export async function getToken(clientId, clientSecret)
export async function apiFetch(url, tokenStore)
```

Rules:

- `getToken` uses OAuth2 client credentials from arguments and API key from `process.env`.
- `apiFetch` makes one authenticated request with `tokenStore.token`.
- On the first `401`, fetch a new token, update `tokenStore.token`, and retry once.
- On a second `401`, throw `Error('Token refresh failed')`.
- For other non-OK responses, throw `Error('Request failed: <status>')`.

## Threat

**The Red Team:** Expired Token Loop starts with a stale token and expects recovery without asking the caller to handle refresh logic.

## Win Condition

Behavior tests and the Red Team pass when one refresh succeeds, token state updates, and retry loops stay bounded.
