export function authorizeToolCall(call, policy) {
  const tool = String(call?.tool ?? '')
  const allowedTools = Array.isArray(policy?.allowedTools) ? policy.allowedTools : []

  const allowed = allowedTools.some((allowedTool) => tool.startsWith(allowedTool))
  if (!allowed) {
    return { allowed: false, reason: 'Tool is not permitted by policy' }
  }

  return { allowed: true }
}

