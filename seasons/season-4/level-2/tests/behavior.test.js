import { describe, it, expect } from 'vitest'
import { evaluateApproval } from '../solution.js'

describe('evaluateApproval', () => {
  it('approves low-risk actions without manual approval', () => {
    const result = evaluateApproval(
      { risk: 'low', requestedBy: 'agent' },
      { humanApproved: false }
    )
    expect(result.approved).toBe(true)
  })

  it('approves high-risk actions when a human approved them', () => {
    const result = evaluateApproval(
      { risk: 'high', requestedBy: 'agent' },
      { humanApproved: true }
    )
    expect(result.approved).toBe(true)
  })

  it('denies high-risk actions without human approval', () => {
    const result = evaluateApproval(
      { risk: 'high', requestedBy: 'agent' },
      { humanApproved: false }
    )
    expect(result.approved).toBe(false)
  })

  it('denies high-risk actions without human approval regardless of requester', () => {
    const result = evaluateApproval(
      { risk: 'high', requestedBy: 'system' },
      { humanApproved: false }
    )
    expect(result.approved).toBe(false)
  })
})
