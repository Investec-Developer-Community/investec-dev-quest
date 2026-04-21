# Hint 2 — Full implementation pattern

```js
const WINDOW_MS = 60_000
const MAX_TXN = 3

export function beforeTransaction(event, kv) {
  const now = new Date(event.dateTime).getTime()
  const cutoff = now - WINDOW_MS

  const timestamps = (kv.get('tx_timestamps') ?? []).filter(t => t > cutoff)

  if (timestamps.length >= MAX_TXN) {
    return { approved: false, message: 'Velocity limit exceeded' }
  }

  timestamps.push(now)
  kv.set('tx_timestamps', timestamps)

  return { approved: true }
}
```

Key detail: push the current timestamp and save **before** returning `approved: true`. The decision to approve is part of the same atomic step as recording the timestamp.

The test for the sliding window reset checks that after 61 seconds, the old timestamps are gone and approval works again.
