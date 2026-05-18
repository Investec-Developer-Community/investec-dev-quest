# Registry Verifier

## Mission Brief

**The Briefing Desk:** FinFlow's agent loads tools from a shared registry. A poisoned duplicate appears before the legitimate tool. Order is not trust.

## Bug Report

The starter returns the first matching tool name even when that entry is untrusted.

## Your Task

Edit `solution.js` and implement:

```js
export function resolveTool(toolName, registry)
```

Rules:

- Registry entries have `{ name, version, trusted, source }`.
- Match by exact tool name.
- Only trusted entries are allowed.
- If several entries match, return a trusted one.
- Return `null` when no trusted match exists.

## Threat

**The Red Team:** Registry Poison inserts an untrusted duplicate ahead of a legitimate tool.

## Win Condition

Behavior tests and the Red Team pass when only trusted exact matches resolve.
