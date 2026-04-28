# Velocity Vault

## Mission Brief

FinFlow's security team has flagged a pattern on one of their business cards: rapid small transactions from multiple merchants in quick succession. This is a classic **carding attack** — a compromised card is being tested with tiny amounts to verify it works before larger fraudulent charges are made.

The rule they want: **no more than 3 transactions within any 60-second window**. If a 4th transaction arrives within 60 seconds of the first, it should be declined.

## Bug Report

The current `beforeTransaction` implementation approves everything, so it has no effective rate limiting for rapid-fire card activity.

## Your Task

Implement velocity limiting in `beforeTransaction`:

```js
export function beforeTransaction(event, kv)
```

### Rules

- Track a rolling log of transaction timestamps under the key `'tx_timestamps'` in `kv`
- The timestamp to use is `event.dateTime` — an ISO 8601 string (`'2026-04-18T10:00:00'`)
- Convert to milliseconds with `new Date(event.dateTime).getTime()`
- Before deciding: remove timestamps older than 60 seconds from the log
- If 3 or more timestamps remain in the log (within the last 60s), **decline** the transaction
- Otherwise, **add** the current timestamp to the log and **approve**
- The rule applies to **all transaction types** — MCC is irrelevant here

### The kv store

Same as Level 2 — use `kv.get('tx_timestamps')` / `kv.set('tx_timestamps', array)`.

Store timestamps as an array of numbers (milliseconds since epoch).

## Threat

The attack fires four transactions in a tight window and expects the fourth to be declined while earlier transactions remain valid.

## Win Condition

Both test suites must pass.

The attack fires 4 transactions with timestamps 1 second apart. The 4th must be **declined**.
