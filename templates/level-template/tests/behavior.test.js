import { describe, it, expect } from 'vitest'
import { yourFunction } from '../solution.js'

describe('yourFunction — happy path', () => {
  it('does the expected thing', () => {
    const result = yourFunction('validInput')
    expect(result).toBe('expectedOutput')
  })

  // Add more positive cases...
})

describe('yourFunction — edge cases', () => {
  it('handles empty input', () => {
    // test edge case behavior
  })
})
