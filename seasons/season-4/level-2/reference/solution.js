export function evaluateApproval(action, context) {
  const risk = String(action?.risk ?? 'low').toLowerCase()
  const humanApproved = context?.humanApproved === true

  if (risk === 'high' && !humanApproved) {
    return { approved: false, reason: 'High-risk actions require human approval' }
  }

  return { approved: true }
}

