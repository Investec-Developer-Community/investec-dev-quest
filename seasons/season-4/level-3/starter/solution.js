export function validateAnswer(answer) {
  const claims = Array.isArray(answer?.claims) ? answer.claims : []
  if (claims.length === 0) return { valid: false, reason: 'No claims to validate' }

  const firstClaim = claims[0]
  const cited = Array.isArray(firstClaim?.sourceIds) && firstClaim.sourceIds.length > 0
  if (!cited) return { valid: false, reason: 'Missing citation on first claim' }

  return { valid: true }
}

