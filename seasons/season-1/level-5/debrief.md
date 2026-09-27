# Debrief: Idempotency Island

## What changed

Payment submission now derives a deterministic idempotency key from the payment payload and sends it as a request header.

## Why it matters

Retries are normal. Duplicate transfers are not. Idempotency lets the server recognize repeated intent.

## Production habit

Every retryable money movement needs a stable operation identity.

## Try it for real

- The real payment endpoint is `POST /za/pb/v1/accounts/{accountId}/paymultiple` (up to 50 payments per request, amounts as strings). See the [Make a payment guide](https://developer.investec.com/individuals).
- Before touching real money, practise retry-safe payment flows in the [sandbox](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox).

