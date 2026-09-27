# Debrief: Replay Rewind

## What changed

The delivery gate now rejects malformed and out-of-window timestamps in both directions, then rejects delivery IDs it has already seen. It records an ID only after the delivery is accepted.

## Why it matters

A valid signature on an old message is still a valid signature. Without a freshness window and a replay cache, one captured payment notification can be turned into many.

## Production habit

Pair signature verification with a bounded timestamp window and an idempotency store keyed by delivery ID. Expire cache entries after the window, and never let rejected traffic consume an ID.

## Try it for real

- Programmable card code can call your own services from `afterTransaction`. Any endpoint you build to receive those calls needs the same freshness and replay checks. See the [Card API](https://developer.investec.com/api-reference/SA%20Card%20Code) and the [card IDE guide](https://developer.investec.com/individuals).
- Browse [community builds](https://github.com/Investec-Developer-Community/Community-Projects) for real webhook-style receivers built on Investec APIs.
