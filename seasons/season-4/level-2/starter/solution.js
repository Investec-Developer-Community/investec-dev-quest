export function evaluateApproval(action, context) {
  const risk = String(action?.risk ?? 'low').toLowerCase()
  if (risk === 'high' && action?.requestedBy !== 'system' && context?.humanApproved !== true) {
    return { approved: false, reason: 'High-risk actions require human approval' }
  }

  return { approved: true }
}

