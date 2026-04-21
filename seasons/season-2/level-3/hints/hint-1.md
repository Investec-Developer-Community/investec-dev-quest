# Hint 1 — The sliding window algorithm

Store an array of timestamps (ms since epoch) in `kv`. Before each decision:

1. Load the array (default `[]`)
2. Remove timestamps older than 60 seconds: `timestamps.filter(t => t > now - 60_000)`
3. If the **filtered** array has 3 or more items → decline
4. Otherwise, push the current timestamp → approve

```js
const now = new Date(event.dateTime).getTime()
const cutoff = now - 60_000
const timestamps = (kv.get('tx_timestamps') ?? []).filter(t => t > cutoff)
```

The `.filter()` step is what makes it a "sliding window" — stale timestamps fall off automatically.
