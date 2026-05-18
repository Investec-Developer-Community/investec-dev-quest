# Limit Loop

## Mission Brief

**The Briefing Desk:** FinFlow enforces a R2,000 daily card limit. Customers are seeing confusing declines after attempted over-limit purchases because declined activity is contaminating stored spend.

## Bug Report

The starter writes the projected spend before it knows whether the transaction is approved.

## Your Task

Edit `solution.js` and implement:

```js
export function beforeTransaction(event, kv)
```

Rules:

- Daily limit is R2,000.
- Convert `event.centsAmount` to Rands.
- Read current spend from `daily_spend`.
- If `totalSpent + amount > 2000`, decline without updating state.
- Only update `daily_spend` for approved transactions.

## Threat

**The Red Team:** Decline Poison sends an over-limit transaction and checks whether rejected activity corrupts future decisions.

## Win Condition

Behavior tests and the Red Team pass when declined transactions do not mutate daily spend.
