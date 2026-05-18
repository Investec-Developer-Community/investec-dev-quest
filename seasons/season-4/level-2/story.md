# Approval Anchor

## Mission Brief

**The Briefing Desk:** An AI deployment agent can open pull requests and propose production changes. High-risk actions need real human approval, not a flattering field inside the action payload.

## Bug Report

The starter trusts `requestedBy` metadata too much, allowing a high-risk action to appear safer than it is.

## Your Task

Edit `solution.js` and implement:

```js
export function evaluateApproval(action, context)
```

Rules:

- High-risk actions require `context.humanApproved === true`.
- Low-risk actions may auto-approve.
- Never trust `action.requestedBy` as approval evidence.
- Return `{ approved: boolean, reason?: string }`.

## Threat

**The Red Team:** Approval Masquerade forges a high-risk action as `requestedBy: "system"`.

## Win Condition

Behavior tests and the Red Team pass when high-risk actions without explicit human approval are denied.
