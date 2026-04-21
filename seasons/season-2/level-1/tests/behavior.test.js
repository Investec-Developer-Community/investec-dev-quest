import { describe, it, expect } from 'vitest'
import { beforeTransaction } from '../solution.js'

/**
 * Helper: build a minimal card event with a given MCC code.
 * The MCC is passed as a string — exactly as the Investec platform sends it.
 */
function makeEvent(mccCode, mccName = 'Test Merchant') {
  return {
    accountNumber: '10011021132',
    dateTime: '2026-04-18T10:00:00',
    centsAmount: 5000,
    currencyCode: 'ZAR',
    type: 'card',
    reference: 'test-ref-001',
    card: { id: 'card-001' },
    merchant: {
      name: 'Test Store',
      city: 'Cape Town',
      country: { code: 'ZA', alpha3: 'ZAF', name: 'South Africa' },
      category: {
        code: String(mccCode), // Always a string — this is intentional
        name: mccName,
      },
    },
  }
}

describe('beforeTransaction — allowed merchants', () => {
  it('approves a grocery store (MCC 5411)', () => {
    const result = beforeTransaction(makeEvent('5411', 'Woolworths Food'))
    expect(result.approved).toBe(true)
  })

  it('approves a restaurant (MCC 5812)', () => {
    const result = beforeTransaction(makeEvent('5812', 'Cafe Lunch'))
    expect(result.approved).toBe(true)
  })

  it('approves a petrol station (MCC 5541)', () => {
    const result = beforeTransaction(makeEvent('5541', 'Shell Garage'))
    expect(result.approved).toBe(true)
  })

  it('approves a clothing store (MCC 5600)', () => {
    const result = beforeTransaction(makeEvent('5600', 'Fashion Outlet'))
    expect(result.approved).toBe(true)
  })
})

describe('beforeTransaction — blocked merchants', () => {
  it('declines gambling/betting (MCC 7995) when code is a string', () => {
    // The platform sends codes as strings — this is the real-world payload shape
    const result = beforeTransaction(makeEvent('7995', 'Casino Online'))
    expect(result.approved).toBe(false)
  })

  it('declines digital games (MCC 5816) when code is a string', () => {
    const result = beforeTransaction(makeEvent('5816', 'Games Store'))
    expect(result.approved).toBe(false)
  })

  it('returns a message when declining', () => {
    const result = beforeTransaction(makeEvent('7995'))
    expect(result).toHaveProperty('message')
    expect(typeof result.message).toBe('string')
  })
})

describe('beforeTransaction — return shape', () => {
  it('always returns an object with approved boolean', () => {
    const allowed = beforeTransaction(makeEvent('5411'))
    const blocked = beforeTransaction(makeEvent('7995'))
    expect(typeof allowed.approved).toBe('boolean')
    expect(typeof blocked.approved).toBe('boolean')
  })
})
