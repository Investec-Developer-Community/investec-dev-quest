# Loop Detector

## Mission Brief

FinFlow's support agent can call tools repeatedly while investigating customer incidents.

## Bug Report

A runaway loop was observed where the agent called the same tool again and again with slightly different parameters, never progressing to the next planning step.

## Your Task

Implement:

```js
export function detectToolLoop(callHistory, maxConsecutiveCalls)
```

Rules:
- `callHistory` contains entries like `{ toolName, params }`
- Detect when the same tool name appears `maxConsecutiveCalls` times in a row
- Parameter differences do not break loop detection
- Return `{ loopDetected: boolean, reason?: string }`

## Threat

The attack sends five consecutive calls to `fetch_data` with different page parameters.

## Win Condition

Both test suites pass.
