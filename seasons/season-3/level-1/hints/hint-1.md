# Hint 1 — Equality matters for signatures

A signature should only pass when the provided value exactly matches the expected digest.

If your check allows prefixes (for example, using `startsWith`), an attacker can forge short values that still pass validation.
