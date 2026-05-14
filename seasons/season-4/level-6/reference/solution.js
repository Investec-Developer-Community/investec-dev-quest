export function detectToolLoop(callHistory, maxConsecutiveCalls) {
  const history = Array.isArray(callHistory) ? callHistory : []
  const threshold = Number.isInteger(maxConsecutiveCalls) ? maxConsecutiveCalls : 3

  if (history.length < threshold) return { loopDetected: false }

  let streak = 1
  for (let i = 1; i < history.length; i++) {
    const prevTool = String(history[i - 1]?.toolName ?? '')
    const currTool = String(history[i]?.toolName ?? '')

    if (currTool && currTool === prevTool) {
      streak += 1
      if (streak >= threshold) {
        return {
          loopDetected: true,
          reason: `Tool \"${currTool}\" called ${streak} times consecutively`,
        }
      }
    } else {
      streak = 1
    }
  }

  return { loopDetected: false }
}
