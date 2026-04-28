# Citation Checkpoint

## Mission Brief

Your AI assistant answers policy questions using internal docs. Every claim must include at least one supporting citation id.

## Bug Report

Answers can pass validation even when later claims are unsupported. The model can still hallucinate policy details after an initially valid-looking claim.

## Your Task

Implement:

```js
export function validateAnswer(answer)
```

Where `answer` has shape:

```js
{
  claims: [
    { text: string, sourceIds: string[] }
  ]
}
```

Rules:
- Every claim must have `sourceIds` with length > 0
- If any claim is missing citations, answer is invalid
- Return `{ valid: boolean, reason?: string }`

## Threat

The attack supplies a fully cited first claim and an uncited second claim.

## Win Condition

Both test suites pass.

Your fix must reject answers when any claim lacks supporting citations.
