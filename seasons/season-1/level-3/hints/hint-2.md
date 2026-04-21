# Hint 2 — Following pagination

The API response includes `meta.nextCursor`. While it's not `null`, there are more pages to fetch.

```js
const transactions = []
let cursor = null

do {
  const url = new URL(`${BASE_URL}/za/pb/v1/accounts/${accountId}/transactions`)
  url.searchParams.set('fromDate', fromDate)
  url.searchParams.set('toDate', toDate)
  if (cursor) url.searchParams.set('cursor', cursor)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()

  transactions.push(...json.data.transactions)
  cursor = json.meta.nextCursor ?? null
} while (cursor !== null)

return transactions
```

This is the same pagination pattern from Level 1 — applied to transactions with date filtering added.
