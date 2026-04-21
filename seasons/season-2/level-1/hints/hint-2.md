# Hint 2 — Normalise Inputs at the Boundary

The fix is about **input normalisation**: converting the incoming string to the same type used in your blocklist before comparing.

Two approaches work:

**Option A — Convert the incoming string to a number:**
```js
const mcc = Number(event.merchant.category.code)
if (BLOCKED_MCCS.includes(mcc)) { ... }
```

**Option B — Convert the blocklist to strings:**
```js
const BLOCKED_MCCS = ['5816', '7995']
```

Either works. Option A is better for a real system because it keeps the blocklist readable as numbers, which match the official MCC specification.

**Key principle**: Always normalise data at system boundaries (API inputs, card events, webhooks) before making security decisions.
