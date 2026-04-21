# Hint 1 — The kv store and cents vs rands

The `kv` parameter is a simple key-value store passed to both functions. Use it to share state between calls.

The card event gives you `centsAmount` (e.g. `10000` = R100). Divide by 100 to get rands.

```js
const amount = event.centsAmount / 100  // R100.00

const current = kv.get('fastfood_spend') ?? 0  // default to 0 if not set yet
```

Start with `afterTransaction` — it's simpler. If `event.merchant.category.code === '5812'`, add to the running total:

```js
kv.set('fastfood_spend', current + amount)
```
