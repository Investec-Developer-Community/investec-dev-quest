# Hint 2 — Use timing-safe full comparison

Compute the expected HMAC, decode both hex digests to buffers, check equal length, then compare with `timingSafeEqual`.

Pattern:

```js
const providedBuffer = Buffer.from(providedHex, 'hex')
const expectedBuffer = Buffer.from(expectedHex, 'hex')
if (providedBuffer.length !== expectedBuffer.length) return false
return timingSafeEqual(providedBuffer, expectedBuffer)
```
