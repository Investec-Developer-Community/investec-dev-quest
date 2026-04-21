# Hint 2 — Pre-condition check in beforeTransaction

The budget check must happen **before** the transaction. Read the current total, add the incoming amount, and check if it exceeds the limit:

```js
export function beforeTransaction(event, kv) {
  if (event.merchant.category.code !== '5812') {
    return { approved: true }
  }

  const current = kv.get('fastfood_spend') ?? 0
  const thisAmount = event.centsAmount / 100

  if (current + thisAmount > 500) {
    return { approved: false, message: 'Monthly fast-food budget exceeded' }
  }

  return { approved: true }
}
```

Notice: `afterTransaction` is responsible for updating the total **after** approval. `beforeTransaction` only reads and decides — it does not update the total itself. The two functions have separate responsibilities.
