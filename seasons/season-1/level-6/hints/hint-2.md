# Hint 2 — Two subtle misses

Two things usually fail first:

1. **Account pagination**
   If you call `/accounts` once with `pageSize=1`, you only see the first account.
   Loop until `meta.nextCursor` is `null`.

2. **Idempotency header placement**
   The API only deduplicates when the key is in the request headers:

```js
headers: {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Idempotency-Key': key,
}
```

Putting a key in the JSON body does not activate server-side deduplication.
