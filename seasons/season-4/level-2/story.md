# Approval Anchor

## Mission Brief

An AI deployment agent can open pull requests and propose production changes. High-risk actions must never auto-approve.

## Bug Report

The starter trusts metadata inside the action too much, so a high-risk action can be made to look safer than it really is.

## Your Task

Implement:

```js
export function evaluateApproval(action, context)
```

Rules:
- High-risk actions require explicit `context.humanApproved === true`
- Low-risk actions may auto-approve
- Never trust `action.requestedBy` as an approval signal
- Return `{ approved: boolean, reason?: string }`

## Threat

The attack forges a high-risk action as `requestedBy: "system"` and expects the approval gate to still require explicit human approval.

## Win Condition

Both test suites pass.

Your fix must deny high-risk actions without human approval.
