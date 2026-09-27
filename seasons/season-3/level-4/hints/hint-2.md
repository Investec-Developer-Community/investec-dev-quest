# Hint 2 — Walk the chain with an expected previous hash

Iterate by position, starting from `GENESIS_HASH`:

```js
let expectedPrevHash = GENESIS_HASH
for (let position = 0; position < log.length; position += 1) {
  const entry = log[position]
  // index matches position? prevHash matches expectedPrevHash? hash recomputes?
  // if any check fails: return { valid: false, brokenAt: position }
  expectedPrevHash = entry.hash
}
```
