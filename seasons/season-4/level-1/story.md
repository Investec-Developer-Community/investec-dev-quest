# Tool Gatekeeper

## The situation

FinFlow runs an AI operations assistant with tool access. The policy is simple:

- Allow only explicitly permitted tools
- Deny everything else by default

A production incident occurred because the implementation used prefix matching. The allowed tool `read.file` accidentally allowed `read.file.delete`.

## Your task

Implement:

```js
export function authorizeToolCall(call, policy)
```

Rules:
- `policy.allowedTools` is an exact allowlist
- Only exact tool names are allowed
- Unknown tools must be denied
- Return shape: `{ allowed: boolean, reason?: string }`

## Win condition

Both test suites pass.

The attack tries a crafted tool name with an allowed prefix. The starter allows it; your fix must block it.
