# Webhook Whiplash

## The situation

FinFlow receives payment notifications through webhooks. To ensure webhook authenticity, each webhook includes:

- `x-investec-timestamp`
- `x-investec-signature` in the format `sha256=<hex>`

Signature algorithm:

1. Build the signed payload: `${timestamp}.${rawBody}`
2. Compute HMAC-SHA256 using a shared secret
3. Compare against the signature from the header

A bug slipped into production: the verification logic uses `startsWith` for signature comparison, which allows partial signatures to pass.

## Your task

Implement:

```js
export function verifyWebhook(headers, rawBody, secret)
```

Rules:
- Return `true` only when the signature is valid
- Return `false` for missing/invalid headers
- Signature header must start with `sha256=`
- Use a full, timing-safe comparison

## Win condition

Both test suites pass.

The attack sends a truncated signature prefix. Starter code incorrectly accepts it. Your fix must reject it.
