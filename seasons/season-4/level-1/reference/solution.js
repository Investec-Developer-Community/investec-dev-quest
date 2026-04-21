export function authorizeToolCall(call, policy) {
  const tool = String(call?.tool ?? '')
  const allowedTools = Array.isArray(policy?.allowedTools) ? policy.allowedTools : []

  if (!tool || !allowedTools.includes(tool)) {
    return { allowed: false, reason: 'Tool is not permitted by policy' }
  }

  return { allowed: true }
}

