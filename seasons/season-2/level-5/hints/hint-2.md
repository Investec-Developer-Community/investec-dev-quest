# Hint 2 — The exact fix

Move the `kv.set` call to **after** the limit check, and only on the approved path:

```js
const DAILY_LIMIT = 2000

export function beforeTransaction(event, kv) {
  const totalSpent = kv.get('daily_spend') ?? 0
  const amount = event.centsAmount / 100

  if (totalSpent + amount > DAILY_LIMIT) {
    return { approved: false, message: 'Daily spend limit exceeded' }
  }

  // Only here — after the check passes — do we update the store
  kv.set('daily_spend', totalSpent + amount)
  return { approved: true }
}
```

This ensures that if a transaction is declined, the stored balance is unchanged. The next transaction will be evaluated against the correct pre-decline balance.
