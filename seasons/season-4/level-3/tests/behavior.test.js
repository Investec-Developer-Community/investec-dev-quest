import { describe, it, expect } from 'vitest'
import { validateAnswer } from '../solution.js'

describe('validateAnswer', () => {
  it('accepts answers where all claims have citations', () => {
    const answer = {
      claims: [
        { text: 'Policy X requires MFA.', sourceIds: ['doc-1'] },
        { text: 'Retention is 90 days.', sourceIds: ['doc-2', 'doc-7'] },
      ],
    }

    expect(validateAnswer(answer).valid).toBe(true)
  })

  it('rejects answers when any claim has no citations', () => {
    const answer = {
      claims: [
        { text: 'Policy X requires MFA.', sourceIds: ['doc-1'] },
        { text: 'Retention is 90 days.', sourceIds: [] },
      ],
    }

    expect(validateAnswer(answer).valid).toBe(false)
  })

  it('rejects empty claim sets', () => {
    expect(validateAnswer({ claims: [] }).valid).toBe(false)
  })
})
