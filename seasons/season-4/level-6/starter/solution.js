export function detectToolLoop(callHistory, maxConsecutiveCalls) {
  const history = Array.isArray(callHistory) ? callHistory : []
  const threshold = Number.isInteger(maxConsecutiveCalls) ? maxConsecutiveCalls : 3

  if (history.length === 0) return { loopDetected: false }

  let streak = 1
  for (let i = 1; i < history.length; i++) {
    const prevTool = String(history[i - 1]?.toolName ?? '')
    const currTool = String(history[i]?.toolName ?? '')
    const prevArgs = JSON.stringify(history[i - 1]?.params ?? {})
    const currArgs = JSON.stringify(history[i]?.params ?? {})

    if (currTool === prevTool && currArgs === prevArgs) {
      streak += 1
      if (streak >= threshold) {
        return {
          loopDetected: true,
          reason: `Tool \"${currTool}\" repeated ${streak} times`,
        }
      }
    } else {
      streak = 1
    }
  }

  return { loopDetected: false }
}
