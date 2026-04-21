import { describe, it, expect } from 'vitest'
import { beforeTransaction } from '../solution.js'
import { createKv } from '../kv.js'

function makeEvent(dateTime, mcc = '5411') {
  return {
    accountNumber: '10011021132',
    dateTime,
    centsAmount: 500,
    currencyCode: 'ZAR',
    type: 'card',
    reference: 'ref-001',
    card: { id: 'card-001' },
    merchant: {
      name: 'Test Store',
      city: 'Cape Town',
      country: { code: 'ZA', alpha3: 'ZAF', name: 'South Africa' },
      category: { code: mcc, name: 'Test' },
    },
  }
}

// Helper: build ISO dateTime string offset by seconds from a base
function offsetTime(baseIso, offsetSeconds) {
  return new Date(new Date(baseIso).getTime() + offsetSeconds * 1000).toISOString()
}

const BASE = '2026-04-18T10:00:00.000Z'

describe('beforeTransaction — within velocity limit', () => {
  it('approves the first transaction', () => {
    const kv = createKv()
    expect(beforeTransaction(makeEvent(BASE), kv).approved).toBe(true)
  })

  it('approves a second transaction 1s later', () => {
    const kv = createKv()
    beforeTransaction(makeEvent(BASE), kv)
    expect(beforeTransaction(makeEvent(offsetTime(BASE, 1)), kv).approved).toBe(true)
  })

  it('approves a third transaction 2s later', () => {
    const kv = createKv()
    beforeTransaction(makeEvent(BASE), kv)
    beforeTransaction(makeEvent(offsetTime(BASE, 1)), kv)
    expect(beforeTransaction(makeEvent(offsetTime(BASE, 2)), kv).approved).toBe(true)
  })
})

describe('beforeTransaction — velocity limit triggered', () => {
  it('declines a 4th transaction within the 60-second window', () => {
    const kv = createKv()
    beforeTransaction(makeEvent(BASE), kv)
    beforeTransaction(makeEvent(offsetTime(BASE, 1)), kv)
    beforeTransaction(makeEvent(offsetTime(BASE, 2)), kv)
    const result = beforeTransaction(makeEvent(offsetTime(BASE, 3)), kv)
    expect(result.approved).toBe(false)
    expect(result.message).toBeTruthy()
  })
})

describe('beforeTransaction — sliding window resets', () => {
  it('approves a transaction after the window expires (61s later)', () => {
    const kv = createKv()
    // 3 transactions in a burst
    beforeTransaction(makeEvent(BASE), kv)
    beforeTransaction(makeEvent(offsetTime(BASE, 1)), kv)
    beforeTransaction(makeEvent(offsetTime(BASE, 2)), kv)

    // 61 seconds after the FIRST transaction — window has expired
    const later = offsetTime(BASE, 61)
    expect(beforeTransaction(makeEvent(later), kv).approved).toBe(true)
  })
})
