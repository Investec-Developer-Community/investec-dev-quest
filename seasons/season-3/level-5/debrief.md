# Debrief: Season Boss: Settlement Sentinel

## What changed

The webhook pipeline now authenticates first with a full, timing-safe HMAC. Then it enforces freshness, rejects duplicates, parses the body, and validates any callback URL against an exact allowlist. It records the delivery ID only on acceptance, and every decision goes through one audited exit on a hash-chained log.

## Why it matters

Each control on its own blocks one attack. Their order is what makes them work together. Burning IDs before authentication hands attackers a denial-of-service lever. Unaudited rejections hide probing. A single weak check lets a chained attack through.

## Production habit

Build inbound integrations as an explicit, ordered pipeline with one audited exit. Authenticate, check freshness, deduplicate, validate, then commit state. Treat the audit trail as part of the security boundary, not an afterthought.

## Try it for real

- Put this pipeline in front of anything your [programmable card code](https://developer.investec.com/api-reference/SA%20Card%20Code) calls from `afterTransaction`, or in front of your own settlement automation built on the [Private Bank API](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information).
- Show your build to other developers in the [Investec Developer Community](https://developer.investec.com/community), and look through [community projects](https://github.com/Investec-Developer-Community/Community-Projects) for ideas.
