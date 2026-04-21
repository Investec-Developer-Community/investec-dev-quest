# Hint 1 — What does a 401 response mean?

A `401 Unauthorized` from the Investec API means the Bearer token in the `Authorization` header is invalid or expired.

OAuth2 access tokens have a limited lifespan (`expires_in` seconds). After that, any request using the old token returns `401`.

**The pattern to implement:**

```
request → 401?
  yes → getToken() → update tokenStore.token → retry request
      → 401 again? → throw 'Token refresh failed'
  no  → non-ok? → throw 'Request failed: <status>'
      → ok? → return json
```

Start with the normal path: make the fetch, check `res.ok`, return `res.json()`. Then add the 401 branch.
