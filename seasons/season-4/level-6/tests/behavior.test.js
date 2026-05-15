import { describe, it, expect } from 'vitest'
import { detectToolLoop } from '../solution.js'

describe('detectToolLoop', () => {
  it('A_S4L6_DETECTS_CONSECUTIVE_TOOL_LOOP_DESPITE_PARAM_CHURN: detects threshold consecutive calls to same tool even when params differ', () => {
    const history = [
      { toolName: 'fetch_data', params: { page: 1 } },
      { toolName: 'fetch_data', params: { page: 2 } },
      { toolName: 'fetch_data', params: { page: 3 } },
    ]

    const result = detectToolLoop(history, 3)
    expect(result.loopDetected).toBe(true)
  })

  it('A_S4L6_DOES_NOT_FLAG_NON_CONSECUTIVE_REUSE: does not flag mixed tool sequence as loop', () => {
    const history = [
      { toolName: 'fetch_data', params: { page: 1 } },
      { toolName: 'rank_results', params: {} },
      { toolName: 'fetch_data', params: { page: 2 } },
      { toolName: 'rank_results', params: {} },
    ]

    const result = detectToolLoop(history, 3)
    expect(result.loopDetected).toBe(false)
  })

  it('returns false for empty history', () => {
    expect(detectToolLoop([], 3).loopDetected).toBe(false)
  })
})
