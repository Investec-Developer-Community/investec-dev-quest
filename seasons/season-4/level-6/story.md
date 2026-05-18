# Loop Detector

## Mission Brief

**The Briefing Desk:** A support agent can call tools while investigating customer incidents. During simulation, it kept calling the same tool with slightly different parameters and never moved the plan forward.

## Bug Report

The starter detects only exact repeated payloads. Parameter churn hides the loop.

## Your Task

Edit `solution.js` and implement:

```js
export function detectToolLoop(callHistory, maxConsecutiveCalls)
```

Rules:

- `callHistory` contains `{ toolName, params }` entries.
- Detect when the same `toolName` appears `maxConsecutiveCalls` times in a row.
- Parameter differences do not break loop detection.
- Return `{ loopDetected: boolean, reason?: string }`.

## Threat

**The Red Team:** Runaway Loop sends five consecutive calls to `fetch_data` with different page parameters.

## Win Condition

Behavior tests and the Red Team pass when repeated tool use is detected without flagging mixed-tool work.
