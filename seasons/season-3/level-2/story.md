# Replay Rewind

## Mission Brief

**The Briefing Desk:** FinFlow's webhook signatures now hold. But an attacker who captures one genuine, correctly signed payment notification can send it again later, and a valid signature proves nothing about *when* a message was sent. Every delivery must be fresh and processed only once.

## Bug Report

The delivery gate never remembers which deliveries it accepted, and it ignores how old the signed timestamp is.

## Your Task

Edit `solution.js` and implement:

```js
export function acceptDelivery(headers, nowSeconds, seen)
```

Rules:

- Read `x-investec-delivery-id` and `x-investec-timestamp` (Unix seconds, as a string).
- Reject missing headers or a timestamp that is not a whole number of seconds.
- Reject timestamps more than `300` seconds away from `nowSeconds`, whether in the past or the future.
- Reject a delivery ID that is already in the `seen` Set.
- Record the delivery ID in `seen` only when the delivery is accepted.
- Return `{ accepted: boolean, reason?: string }`.

## Threat

**The Red Team:** Rewind Replay resends a captured notification hours later under a new delivery ID.

## Win Condition

Behavior tests and the Red Team pass when fresh deliveries are accepted once, and stale or duplicate deliveries are rejected.

## Field Notes

Signatures answer "who sent this?". Replay windows and delivery IDs answer "is this new?".
