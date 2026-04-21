import { describe, it, expect } from 'vitest'
import { beforeTransaction } from '../solution.js'

function makeEvent(countryCode, centsAmount = 10000) {
  return {
    accountNumber: '10011021132',
    dateTime: '2026-04-18T10:00:00',
    centsAmount,
    currencyCode: 'ZAR',
    type: 'card',
    reference: 'ref-001',
    card: { id: 'card-001' },
    merchant: {
      name: 'Test Store',
      city: 'Test City',
      country: { code: countryCode, alpha3: 'TST', name: 'Test Country' },
      category: { code: '5411', name: 'Grocery' },
    },
  }
}

describe('beforeTransaction — allowed countries', () => {
  it('approves ZA (uppercase)', () => {
    expect(beforeTransaction(makeEvent('ZA')).approved).toBe(true)
  })

  it('approves NA (uppercase)', () => {
    expect(beforeTransaction(makeEvent('NA')).approved).toBe(true)
  })

  it('approves za (lowercase) — case insensitive', () => {
    expect(beforeTransaction(makeEvent('za')).approved).toBe(true)
  })

  it('approves na (lowercase) — case insensitive', () => {
    expect(beforeTransaction(makeEvent('na')).approved).toBe(true)
  })
})

describe('beforeTransaction — blocked countries', () => {
  it('declines GB (United Kingdom)', () => {
    const result = beforeTransaction(makeEvent('GB'))
    expect(result.approved).toBe(false)
    expect(result.message).toBeTruthy()
  })

  it('declines US (United States)', () => {
    expect(beforeTransaction(makeEvent('US')).approved).toBe(false)
  })

  it('declines DE (Germany)', () => {
    expect(beforeTransaction(makeEvent('DE')).approved).toBe(false)
  })

  it('declines an empty country code', () => {
    expect(beforeTransaction(makeEvent('')).approved).toBe(false)
  })
})
