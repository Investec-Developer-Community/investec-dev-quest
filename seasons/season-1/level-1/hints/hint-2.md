# Hint 2 — Pagination

The Investec API uses **cursor-based pagination**. The response includes a `meta.nextCursor` field.

When `meta.nextCursor` is not `null`, there are more pages. Pass it as a query parameter:

```
GET /za/pb/v1/accounts?cursor=<value>
```

Pattern to follow all pages:

```js
const accounts = []
let cursor = null

do {
  const url = new URL(`${BASE_URL}/za/pb/v1/accounts`)
  if (cursor) url.searchParams.set('cursor', cursor)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  const json = await res.json()
  accounts.push(...json.data.accounts)
  cursor = json.meta.nextCursor ?? null
} while (cursor !== null)
```

Apply the same pattern for any paginated endpoint.
