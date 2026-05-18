# Webhook Whiplash

## Mission Brief

**The Briefing Desk:** FinFlow receives payment notifications by webhook. Before downstream systems react, the signature must prove the message came from the expected sender and was not trimmed, forged, or replay-shaped.

## Bug Report

Malformed signatures can be accepted when the verifier treats a partial match as good enough.

## Your Task

Edit `solution.js` and implement:

```js
export function verifyWebhook(headers, rawBody, secret)
```

Rules:

- Read `x-investec-timestamp`.
- Read `x-investec-signature`.
- Signature format must be `sha256=<hex>`.
- Build the signed payload as `${timestamp}.${rawBody}`.
- Compute HMAC-SHA256 using the shared secret.
- Return `true` only for a valid full signature.
- Return `false` for missing or malformed headers.
- Use a timing-safe full comparison.

## Threat

**The Red Team:** Signature Shard sends a truncated signature prefix.

## Win Condition

Behavior tests and the Red Team pass when only complete valid webhook signatures are accepted.
