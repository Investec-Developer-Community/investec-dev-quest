# Hint 1 — What is idempotency?

An operation is **idempotent** if calling it multiple times with the same input produces the same result as calling it once.

For payments, this means: if the network drops after you send a payment request and you retry, the bank should process the payment **once**, not twice.

The Investec API supports this via an `Idempotency-Key` header. If the server sees the same key twice, it returns the cached response from the first call.

**Your job**: generate this key and attach it to every payment request.

The key must be derived from the payment data so the same payment always generates the same key.
