# Citation Checkpoint

## Mission Brief

**The Briefing Desk:** A support assistant answers internal policy questions from trusted docs. One cited claim at the top does not make the whole answer safe.

## Bug Report

The starter validates the first claim and lets later unsupported claims through.

## Your Task

Edit `solution.js` and implement:

```js
export function validateAnswer(answer)
```

Input shape:

```js
{ claims: [{ text: string, sourceIds: string[] }] }
```

Rules:

- Every claim must have `sourceIds` with at least one entry.
- If any claim is missing citations, the answer is invalid.
- Return `{ valid: boolean, reason?: string }`.

## Threat

**The Red Team:** Citation Mirage supplies a cited first claim and an uncited second claim.

## Win Condition

Behavior tests and the Red Team pass when every claim is checked, not just the first.
