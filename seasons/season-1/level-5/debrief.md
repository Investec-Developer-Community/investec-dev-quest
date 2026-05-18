# Debrief: Idempotency Island

## What changed

Payment submission now derives a deterministic idempotency key from the payment payload and sends it as a request header.

## Why it matters

Retries are normal. Duplicate transfers are not. Idempotency lets the server recognize repeated intent.

## Production habit

Every retryable money movement needs a stable operation identity.

