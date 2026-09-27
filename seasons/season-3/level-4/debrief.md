# Debrief: Ledger Lock

## What changed

The verifier now walks the log by position, starting from the genesis hash. Each entry must sit at its claimed index, link to the previous entry's hash, and recompute to its own hash. The first failing position is reported.

## Why it matters

Auditors and incident responders rely on decision logs to reconstruct what happened. If entries can be quietly edited, removed, or reordered, the log becomes a story the attacker gets to write.

## Production habit

Chain audit entries and check the links, not just each record. Anchor the latest head hash outside the writer's control (a separate store, a signed checkpoint, or a published digest) so a full rewrite is detectable too.

## Try it for real

- Transaction data from the [Private Bank API](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information) is a natural input for a tamper-evident spending ledger. Try it against the [sandbox](https://developer.investec.com/api-reference/SA%20PB%20Account%20Information#description/sandbox).
- Card code's `afterTransaction` hook runs after every card transaction. See the [card IDE guide](https://developer.investec.com/individuals) for a hook you could use to append chained audit entries.
