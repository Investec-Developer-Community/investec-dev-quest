# Debrief: Velocity Vault

## What changed

The rule now keeps a rolling 60-second timestamp window and declines the transaction that exceeds the allowed count.

## Why it matters

Fraud velocity is about recent sequences, not lifetime totals.

## Production habit

For rate limits, prune old state before making the current decision.

