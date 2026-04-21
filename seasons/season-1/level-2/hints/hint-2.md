# Hint 2 — The tokenStore pattern

The `tokenStore` is a plain object `{ token: '...' }` passed by reference. Because objects are passed by reference in JavaScript, updating `tokenStore.token` inside `apiFetch` is visible to the caller.

```js
export async function apiFetch(url, tokenStore) {
  const clientId = process.env.GAME_API_CLIENT_ID
  const clientSecret = process.env.GAME_API_CLIENT_SECRET

  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenStore.token}` },
  })

  if (res.status === 401) {
    const refreshed = await getToken(clientId, clientSecret)
    tokenStore.token = refreshed.access_token  // mutate in place

    res = await fetch(url, {
      headers: { Authorization: `Bearer ${tokenStore.token}` },
    })

    if (res.status === 401) throw new Error('Token refresh failed')
  }

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}
```

Notice: `getToken` can throw `'Authentication failed'` if the credentials in env are wrong. That error propagates naturally — don't catch it here.
