# Registry Verifier

## Mission Brief

FinFlow's agent loads tools from a shared registry before executing user requests.

## Bug Report

A poisoned registry entry was inserted ahead of a legitimate tool. The resolver trusted ordering and executed the attacker-controlled tool.

## Your Task

Implement:

```js
export function resolveTool(toolName, registry)
```

Rules:
- Tool entries have `{ name, version, trusted, source }`
- Resolve by exact name
- Only trusted entries are allowed
- If multiple matching names exist, return a trusted one
- Return `null` when no trusted match exists

## Threat

The attack provides a duplicate tool where the first entry is untrusted and malicious.

## Win Condition

Both test suites pass.
