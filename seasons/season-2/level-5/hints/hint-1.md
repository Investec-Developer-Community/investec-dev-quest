# Hint 1 — Separate the check from the update

The key rule: **only update state for transactions you approve**.

Think of it as two separate questions:
1. "Would this transaction put me over the limit?" → decide yes/no
2. "Should I record this spend?" → only if approved

In code:

```js
// WRONG — updates before deciding
kv.set('daily_spend', totalSpent + amount)
if (over_limit) return declined

// RIGHT — decides before updating
if (over_limit) return declined   // no store update
kv.set('daily_spend', totalSpent + amount)
return approved
```
