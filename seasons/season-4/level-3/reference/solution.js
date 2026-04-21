export function validateAnswer(answer) {
  const claims = Array.isArray(answer?.claims) ? answer.claims : []
  if (claims.length === 0) return { valid: false, reason: 'No claims to validate' }

  const allCited = claims.every(
    (claim) => Array.isArray(claim?.sourceIds) && claim.sourceIds.length > 0
  )

  if (!allCited) return { valid: false, reason: 'Missing citation on one or more claims' }
  return { valid: true }
}

