# Hint 2 — Match known prompt-injection markers

A practical baseline is to detect bracketed directive keywords:

```js
/\[(IGNORE|SKIP|PAY|CANCEL|OVERRIDE|EXECUTE)/i
```

If matched, mark the record unsafe and redact the description in summary text.
