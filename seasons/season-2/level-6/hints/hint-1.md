# Hint 1 — Decide first, mutate second

Most failures in this boss come from state writes happening too early.

Structure `beforeTransaction` as:

1. validate MCC and country
2. compute velocity and spend projections
3. decline immediately if any rule fails
4. only then write updated state for approved flows

If you mutate `daily_spend` before deciding, the attack can poison later decisions.
