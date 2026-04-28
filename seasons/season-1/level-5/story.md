# Idempotency Island

## Mission Brief

FinFlow's payment service has a critical bug. After a network outage last week, the retry logic fired — and some customers were charged **twice** for the same payment.

## Bug Report

The suspicious pattern: retries sometimes produce a second transfer response instead of safely returning the result of the first successful payment.

This is a well-known problem in distributed systems. The solution is **idempotency**: attach a unique key to each payment request, derived from the request itself. The server uses that key to detect and deduplicate retries.

The Investec mock API supports this via an `Idempotency-Key` header.

## Your Task

Fix `submitPayment` so it:

1. Generates an `Idempotency-Key` from the payment data (hash of the payload)
2. Sends the key as a request header
3. Returns the payment response

```js
export async function submitPayment(token, accountId, paymentRequest)
```

Where `paymentRequest` is:
```js
{
  beneficiaryId: 'ben-001',
  amount: 500.00,
  myReference: 'Invoice 1042',
  theirReference: 'Payment from J Soap'
}
```

### Idempotency key rules

- Must be derived **deterministically** from the payment data — the same input must always produce the same key
- Use `crypto.createHash('sha256').update(JSON.stringify(paymentRequest)).digest('hex')`
- Send as `Idempotency-Key: <hash>` header

### API endpoint

```
POST /za/pb/v1/accounts/:accountId/paymultiple
Content-Type: application/json
Idempotency-Key: <sha256-hash>
Authorization: Bearer <token>
```

Response (200):
```json
{
  "data": {
    "TransferResponses": [
      {
        "PaymentReferenceNumber": "...",
        "status": "ACCEPTED",
        "amount": 500,
        "beneficiaryId": "ben-001"
      }
    ]
  }
}
```

If the same `Idempotency-Key` is sent again, the API returns the **same response** without processing a second payment.

## Threat

The attack repeats the same payment request and checks that the API treats the retry as the same operation, not a second transfer.

## Win Condition

Both test suites must pass.

The attack script will call `submitPayment` twice with identical data and verify that only **one** payment is processed.
