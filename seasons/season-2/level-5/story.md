# Limit Loop

## The situation

FinFlow enforces a **R2,000 daily spend limit** on their prepaid cards. After a month in production, a few customers have complained about being able to spend slightly over the limit — sometimes by hundreds of rands.

The bug is subtle. Here is the relevant code:

```js
function beforeTransaction(event, kv) {
  const totalSpent = kv.get('daily_spend') ?? 0
  const amount = event.centsAmount / 100

  // BUG: This adds first, then checks
  kv.set('daily_spend', totalSpent + amount)

  if (totalSpent + amount > DAILY_LIMIT) {
    return { approved: false, message: 'Daily limit exceeded' }
  }

  return { approved: true }
}
```

Spot the problem:

- The spend is **updated** before the decision is made
- If this transaction takes spend from R1,800 to R2,100, the code does: update → then check → correctly declines
- But the **next** transaction will see R2,100 in the store, even though the first was declined

Wait — there's a second bug too. What if `totalSpent` is R1,800 and `amount` is R300? The check is `totalSpent + amount > DAILY_LIMIT`, which is `2100 > 2000` → `true` → declined. That's correct.

What if `totalSpent` is R1,800 and `amount` is R200? `2000 > 2000` is `false` → approved. The limit is hit exactly and it's allowed. That's also correct.

What if `totalSpent` is R1,800 and `amount` is R200, then **same thing again**? The store was updated to R2,000 after the first. Now `2000 + 200 > 2000` is `true` → declined. Correct.

So what's the actual bug? **The store is updated even when the transaction is later declined.** The declined amount is still added to `daily_spend`. Over time this inflates the stored balance beyond the actual amount spent, causing early false-positives — or if the check is accidentally the wrong way, letting real over-limit transactions through.

Fix the implementation so the store is only updated for **approved** transactions.

## Your task

```js
export function beforeTransaction(event, kv)
```

Rules:
- Daily limit is **R2,000**
- Check BEFORE updating: if `totalSpent + amount > DAILY_LIMIT` → decline without updating
- Only update `daily_spend` when the transaction is approved
- Use `event.centsAmount / 100` for the amount in rands

## Win condition

Both test suites must pass.

The attack sets `daily_spend` to R1,800 then fires a R300 transaction. With the bug, the spend is updated to R2,100 even though the transaction is (eventually) declined. The test confirms the stored balance is R1,800 (unchanged) after a declined transaction — proving the store is only written for approvals.
