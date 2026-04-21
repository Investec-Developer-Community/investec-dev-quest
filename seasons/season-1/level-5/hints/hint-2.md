# Hint 2 — Deriving the idempotency key

Use Node's built-in `crypto` module to hash the payment payload:

```js
import { createHash } from 'crypto'

const idempotencyKey = createHash('sha256')
  .update(JSON.stringify(paymentRequest))
  .digest('hex')
```

Then add it as a header to your fetch call:

```js
const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/${accountId}/paymultiple`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
  },
  body: JSON.stringify({ paymentList: [paymentRequest] }),
})
```

`JSON.stringify` on the same object always produces the same string (object key order is stable when the object is built the same way), so the hash is deterministic.
