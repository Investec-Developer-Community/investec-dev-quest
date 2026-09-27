# Season Boss: Settlement Sentinel

## Mission Brief

**The Briefing Desk:** Month-end settlement notifications are arriving, and FinFlow's single webhook entry point decides what the payment engine trusts. Everything from this season meets here.

## Bug Report

The pipeline checks signatures by prefix, ignores freshness, burns delivery IDs before verifying the sender, string-matches callbacks, and logs only acceptances.

## Your Task

Edit `solution.js`. `appendAuditEntry` already works. Fix:

```js
export function processWebhook(request, context)
```

`request` is `{ headers, rawBody }`. `context` is `{ secret, nowSeconds, seenDeliveryIds, allowedCallbackHosts, auditLog }`.

Rules, in order:

1. Missing delivery ID, timestamp, or signature header → reject.
2. Signature must be a full, timing-safe `sha256=<hex>` HMAC of `${timestamp}.${rawBody}`.
3. Timestamp must be whole seconds within `300` seconds of `nowSeconds`.
4. Duplicate delivery ID → reject.
5. Body must be JSON. Any `callbackUrl` must be `https:`, credential-free, port 443, with a hostname exactly in `allowedCallbackHosts`.
6. Record the delivery ID only when accepted.
7. Append `{ deliveryId, status, reason }` to `auditLog` for **every** decision.

Return `{ status: 'accepted' }` or `{ status: 'rejected', reason }`.

## Threat

**The Red Team:** Sentinel Breach chains a truncated signature, a replayed capture, and a metadata-address callback.

## Win Condition

Behavior tests and the Red Team pass when only fresh, authentic, safe deliveries are accepted and every decision is audited.
