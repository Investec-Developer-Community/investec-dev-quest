# Ledger Lock

## Mission Brief

**The Briefing Desk:** Month-end is near, and auditors want proof that FinFlow's payment decision log hasn't been edited. The log is hash-chained: every entry carries the hash of the entry before it.

## Bug Report

The verifier checks each entry's hash on its own. It never checks that entries link to each other, or that they sit at the index they claim.

## Your Task

Edit `solution.js`. `hashEntry` and `appendEntry` already work. Fix:

```js
export function verifyChain(log)
```

Rules:

- An empty log is valid.
- Entry `i` must have `index === i`.
- The first entry's `prevHash` must be `GENESIS_HASH`. Every later `prevHash` must equal the previous entry's `hash`.
- Every `hash` must equal `hashEntry(index, prevHash, event)`.
- Return `{ valid: true }` or `{ valid: false, brokenAt }`, where `brokenAt` is the position of the first failing entry.

## Threat

**The Red Team:** Quiet Rewrite edits, deletes, and reorders entries, recomputing hashes so each entry still looks self-consistent.

## Win Condition

Behavior tests and the Red Team pass when any edit, deletion, or reordering breaks verification at the right position.

## Field Notes

A hash chain is only as trustworthy as its head hash. Store the latest one where the log writer cannot change it.
