# Hint 2 — The tokenStore pattern

The `tokenStore` is a plain object passed by reference. You can keep both the current token and its expiry on it:

```js
function hasUsableToken(tokenStore) {
  if (!tokenStore.token) return false
  if (!tokenStore.expiresAt) return true
  return Date.now() < tokenStore.expiresAt
}
```

When you refresh:

```js
const refreshed = await getToken(clientId, clientSecret)
tokenStore.token = refreshed.access_token
tokenStore.expiresAt = Date.now() + Math.max(refreshed.expires_in - 30, 0) * 1000
```

The 30-second buffer is a defensive cushion so you do not reuse a token right at the edge of expiry.

After that, make the request with `Authorization: Bearer ${tokenStore.token}`. If the API still returns `401`, refresh once and retry once.
