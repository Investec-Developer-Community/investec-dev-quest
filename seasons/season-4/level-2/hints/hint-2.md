# Hint 2 — Separate risk policy from actor metadata

For `risk === 'high'`, require:

```js
context?.humanApproved === true
```

Do not branch approval logic on `requestedBy`.
