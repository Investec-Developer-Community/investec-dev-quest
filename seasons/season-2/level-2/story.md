# Budget Guardian

## Mission Brief

**The Briefing Desk:** A parent has set a R500 monthly fast-food limit on a teenager's programmable card. Six R100 restaurant taps should not all pass. The sixth should hit the guardrail.

## Bug Report

The starter approves every transaction before the running fast-food spend is checked.

## Your Task

Edit `solution.js` and implement:

```js
export function beforeTransaction(event, kv)
export function afterTransaction(event, kv)
```

Rules:

- Track only MCC `5812`.
- `event.centsAmount` is cents; divide by 100 for Rands.
- Store running spend in `kv` under `fastfood_spend`.
- In `beforeTransaction`, decline when current spend plus this transaction exceeds `500`.
- In `afterTransaction`, add approved fast-food spend.
- Other MCCs should approve.

## Threat

**The Red Team:** Budget Drift simulates repeated fast-food approvals and checks whether the monthly cap actually stops the next transaction.

## Win Condition

Behavior tests and the Red Team pass when the sixth R100 fast-food transaction is declined without blocking unrelated merchants.
