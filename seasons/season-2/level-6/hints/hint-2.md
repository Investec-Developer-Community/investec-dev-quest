# Hint 2 — Normalize all boundary inputs

Two normalizations matter here:

1. MCC comparisons:

```js
const mcc = Number(event?.merchant?.category?.code)
```

2. Country comparisons:

```js
const country = String(event?.merchant?.country?.code ?? '').trim().toUpperCase()
```

Then enforce rule order strictly before writing state.

Also keep `afterTransaction` category-scoped: only increment `fastfood_spend` for MCC `5812`.
