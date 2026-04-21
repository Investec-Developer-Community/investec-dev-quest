# Hint 1 — String normalisation at the boundary

The Investec card event sends country codes in **uppercase** (`"ZA"`). Your allowlist should match that, or you should normalise the input before checking.

Both are valid — pick one and be consistent:

```js
// Option A: normalise input to uppercase
const code = event.merchant.country.code.toUpperCase()
const ALLOWED = ['ZA', 'NA']

// Option B: normalise input to lowercase
const code = event.merchant.country.code.toLowerCase()
const ALLOWED = ['za', 'na']
```

The key insight: always normalise at the boundary (when the data enters your rule), not in the middle of the logic.
