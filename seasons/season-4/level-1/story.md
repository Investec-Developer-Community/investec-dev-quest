# Tool Gatekeeper

## Mission Brief

FinFlow runs an AI operations assistant with tool access. The policy is simple:

- Allow only explicitly permitted tools
- Deny everything else by default

## Bug Report

A production incident occurred when a permitted read-only tool name also matched a more powerful tool name. The policy needs exact tool decisions, not look-alike matches.

## Your Task

Implement:

```js
export function authorizeToolCall(call, policy)
```

Rules:
- `policy.allowedTools` is an exact allowlist
- Only exact tool names are allowed
- Unknown tools must be denied
- Return shape: `{ allowed: boolean, reason?: string }`

## Threat

The attack uses a crafted tool name that starts with an allowed tool but is not itself allowed.

## Win Condition

Both test suites pass.

The attack tries a crafted tool name with an allowed prefix. Your fix must block it.
