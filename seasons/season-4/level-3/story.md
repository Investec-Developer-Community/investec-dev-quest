# Citation Checkpoint

## The situation

Your AI assistant answers policy questions using internal docs. Every claim must include at least one supporting citation id.

A bug slipped in: only the first claim is validated. The model can hallucinate unsupported claims later in the answer.

## Your task

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

## Win condition

Both test suites pass.

The attack supplies a fully cited first claim and an uncited second claim. Starter accepts it; your fix must reject it.
