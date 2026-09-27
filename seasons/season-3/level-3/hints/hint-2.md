# Hint 2 — Parse first, then compare exact parts

Node's WHATWG `URL` gives you the pieces you need:

```js
let url
try { url = new URL(String(input)) } catch { return { allowed: false, reason: 'malformed' } }
// url.protocol, url.username, url.password, url.port, url.hostname
```

The default port is reported as an empty string. Lowercase both the hostname and the allowlist before an exact `includes` check on the array, not on the URL string.
