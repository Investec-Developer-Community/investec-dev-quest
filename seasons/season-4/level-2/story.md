# Approval Anchor

## The situation

An AI deployment agent can open pull requests and propose production changes. High-risk actions must never auto-approve.

The buggy implementation trusts `requestedBy: "system"` and bypasses manual approval for high-risk actions.

## Your task

Implement:

```js
export function evaluateApproval(action, context)
```

Rules:
- High-risk actions require explicit `context.humanApproved === true`
- Low-risk actions may auto-approve
- Never trust `action.requestedBy` as an approval signal
- Return `{ approved: boolean, reason?: string }`

## Win condition

Both test suites pass.

The attack forges a high-risk action as `requestedBy: "system"`. Starter approves it; your fix must deny it without human approval.
