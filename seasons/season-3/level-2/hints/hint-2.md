# Hint 2 — Validate, then remember

Order the checks so cheap, stateless rejections come first. Only write to `seen` at the very end.

```js
if (!/^\d+$/.test(String(rawTimestamp))) return { accepted: false, reason: 'invalid-timestamp' }
if (Math.abs(nowSeconds - Number(rawTimestamp)) > 300) return { accepted: false, reason: 'stale' }
// duplicate check, then record the id and accept
```
