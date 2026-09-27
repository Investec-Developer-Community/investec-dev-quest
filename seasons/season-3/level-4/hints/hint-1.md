# Hint 1 — Self-consistent is not the same as chained

The Red Team never produces an entry whose own hash is wrong. Ask yourself:

- After deleting entry 1, what does the new entry 1 claim as its `index`?
- After editing and rehashing entry 1, which *other* entry now disagrees with it?
- What should the first entry's `prevHash` be compared against?

The verifier needs to carry something forward from one entry to the next.
