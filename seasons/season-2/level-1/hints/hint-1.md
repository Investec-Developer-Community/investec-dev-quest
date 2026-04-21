# Hint 1 — The Real Payload

Look carefully at how `BLOCKED_MCCS` is defined, and compare it to what the card event actually delivers.

```js
const BLOCKED_MCCS = [5816, 7995]  // numbers

const mcc = event.merchant.category.code  // what type is this?
```

Try logging `typeof mcc` to understand what you're comparing against.

JavaScript's `Array.includes()` uses **strict equality** (`===`). 

What happens when you compare `7995 === "7995"`?
