# Limit Loop

## Mission Brief

FinFlow enforces a **R2,000 daily spend limit** on their prepaid cards. After a month in production, a few customers have complained about confusing declines after attempted over-limit purchases.

## Bug Report

The tricky part is not only the comparison. Look at when state is written, and ask whether a transaction that is not approved should still change the stored daily spend.

Fix the implementation so the store is only updated for **approved** transactions.

## Your Task

```js
export function beforeTransaction(event, kv)
```

Rules:
- Daily limit is **R2,000**
- Check BEFORE updating: if `totalSpent + amount > DAILY_LIMIT` → decline without updating
- Only update `daily_spend` when the transaction is approved
- Use `event.centsAmount / 100` for the amount in rands

## Threat

The attack sends an over-limit transaction and checks that declined activity does not corrupt the stored spend total.

## Win Condition

Both test suites must pass.

The attack sets `daily_spend` close to the limit, fires an over-limit transaction, and then checks that declined activity did not corrupt the stored spend total.
