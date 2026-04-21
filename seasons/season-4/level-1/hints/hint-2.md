# Hint 2 — Replace prefix logic with exact membership

Use exact comparison against the allowlist:

```js
const allowed = allowedTools.includes(tool)
```

Deny by default when no exact match exists.
