# Debrief: Velocity Vault

## What changed

The rule now keeps a rolling 60-second timestamp window and declines the transaction that exceeds the allowed count.

## Why it matters

Fraud velocity is about recent sequences, not lifetime totals.

## Production habit

For rate limits, prune old state before making the current decision.

## Try it for real

- Velocity rules must stay fast: real `beforeTransaction` code has a roughly 2-second window. Keep the pruning step cheap. See the [card IDE guide](https://developer.investec.com/individuals).
- Explore what others have built with card code in [community projects](https://github.com/Investec-Developer-Community/Community-Projects).

