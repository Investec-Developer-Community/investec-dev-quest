# Hint 1 — Sequence and boundaries

This boss is mostly an orchestration problem.

Split it into small steps and keep each step explicit:

1. authenticate
2. fetch all accounts with cursor pagination
3. verify account exists
4. fetch transactions with date filters and cursor pagination
5. validate beneficiary
6. submit payment with idempotency header

If one step is hidden or skipped, attack tests will usually catch it.
