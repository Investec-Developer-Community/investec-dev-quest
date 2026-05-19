# Hint 1 — Token lifetime before token refresh

The OAuth token response includes `expires_in`, which tells you how long the access token can be reused.

Do not call `getToken()` before every API request. Store the token and an expiry timestamp in `tokenStore`, then reuse the token while it is still valid.

**The pattern to implement:**

```
token missing or expired?
  yes → getToken() → update tokenStore.token and tokenStore.expiresAt
  no  → reuse tokenStore.token

request → 401?
  yes → refresh once → retry request
      → 401 again? → throw 'Token refresh failed'
```

Start by removing the eager token request from the normal path. Then add the expiry check and the bounded 401 branch.
