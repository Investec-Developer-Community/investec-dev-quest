# Tool Gatekeeper

## Mission Brief

**The Briefing Desk:** FinFlow's AI operations assistant can call tools. A read-only tool and a more powerful tool share a tempting prefix. The policy must make exact decisions, not vibes.

## Bug Report

The starter allows look-alike tool names when they start with an allowed name.

## Your Task

Edit `solution.js` and implement:

```js
export function authorizeToolCall(call, policy)
```

Rules:

- `policy.allowedTools` is an exact allowlist.
- Only exact tool names are allowed.
- Unknown tools are denied.
- Return `{ allowed: boolean, reason?: string }`.

## Threat

**The Red Team:** Prefix Phantom crafts a tool name that starts with an allowed tool but is not itself allowed.

## Win Condition

Behavior tests and the Red Team pass when exact allowed tools work and look-alike tools are denied.
