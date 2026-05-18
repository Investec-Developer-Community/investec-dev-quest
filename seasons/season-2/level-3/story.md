# Velocity Vault

## Mission Brief

**The Briefing Desk:** A business card is seeing rapid small transactions across merchants, the kind of pattern fraud teams watch before larger charges arrive. FinFlow needs a rolling-window throttle.

## Bug Report

The starter records activity but approves every event. It does not enforce the 60-second transaction limit.

## Your Task

Edit `solution.js` and implement:

```js
export function beforeTransaction(event, kv)
```

Rules:

- Store timestamps under `tx_timestamps`.
- Use `event.dateTime` and convert it with `new Date(...).getTime()`.
- Before deciding, remove timestamps older than 60 seconds.
- If 3 or more timestamps remain, decline the transaction.
- Otherwise add the current timestamp and approve.
- Apply this to all transaction types.

## Threat

**The Red Team:** Velocity Burst fires four transactions one second apart.

## Win Condition

Behavior tests and the Red Team pass when the fourth transaction in the window is declined and earlier valid transactions remain approved.
