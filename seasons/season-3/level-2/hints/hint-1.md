# Hint 1 — Two different questions

A delivery can fail freshness in two separate ways. Ask yourself:

- Once you accept a delivery, how would you recognise the same delivery ID next time?
- How old is the signed timestamp compared with `nowSeconds`? What about a timestamp from the future?
- Should a rejected delivery be allowed to "use up" its delivery ID?

Find where the gate returns `accepted: true` and list what it checked before getting there.
