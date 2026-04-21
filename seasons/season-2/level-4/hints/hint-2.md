# Hint 2 — The exact fix

The buggy code only has one return path after the allowlist check:

```js
if (ALLOWED_COUNTRIES.includes(code)) {
  return { approved: true }  // ZA and NA: fine
}

return { approved: true }  // BUG: Everything else is also approved!
```

The fix: return a **decline** for countries NOT in the list:

```js
const ALLOWED_COUNTRIES = ['ZA', 'NA']

export function beforeTransaction(event) {
  const code = event.merchant.country.code.toUpperCase()

  if (!ALLOWED_COUNTRIES.includes(code)) {
    return { approved: false, message: 'Transaction not permitted in this country' }
  }

  return { approved: true }
}
```
