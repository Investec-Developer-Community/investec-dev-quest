# Idempotency Island

## Mission Brief

**The Briefing Desk:** A retry after a simulated network outage produced duplicate transfers. Month-end payments cannot depend on luck; the same payment attempt must resolve to the same operation.

## Bug Report

`submitPayment` sends the payment payload, but it does not attach the deterministic idempotency header the mock Investec API uses to deduplicate retries.

## Your Task

Edit `solution.js` and implement:

```js
export async function submitPayment(token, accountId, paymentRequest)
```

Rules:

- Build an idempotency key from the payment data with `crypto.createHash('sha256').update(JSON.stringify(paymentRequest)).digest('hex')`.
- Send it as `Idempotency-Key`.
- POST to `/za/pb/v1/accounts/:accountId/paymultiple`.
- Send `{ paymentList: [paymentRequest] }` as JSON.
- Return the payment response.

## Threat

**The Red Team:** Duplicate Payment Echo submits the same transfer twice and checks whether the second call creates a new payment.

## Win Condition

Behavior tests and the Red Team pass when identical retry payloads produce one stable payment response.
