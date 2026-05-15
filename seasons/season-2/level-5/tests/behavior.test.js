import { describe, it, expect } from 'vitest'
import { beforeTransaction } from '../solution.js'
import { createKv } from '../kv.js'

function makeEvent(centsAmount) {
  return {
    accountNumber: '10011021132',
    dateTime: '2026-04-18T10:00:00',
    centsAmount,
    currencyCode: 'ZAR',
    type: 'card',
    reference: 'ref-001',
    card: { id: 'card-001' },
    merchant: {
      name: 'Store',
      city: 'Cape Town',
      country: { code: 'ZA', alpha3: 'ZAF', name: 'South Africa' },
      category: { code: '5411', name: 'Grocery' },
    },
  }
}

describe('beforeTransaction — basic daily limit', () => {
  it('approves a transaction when well under the R2,000 limit', () => {
    const kv = createKv()
    expect(beforeTransaction(makeEvent(50000), kv).approved).toBe(true) // R500
  })

  it('approves the transaction that hits exactly R2,000', () => {
    const kv = createKv()
    kv.set('daily_spend', 1800)
    expect(beforeTransaction(makeEvent(20000), kv).approved).toBe(true) // R1,800 + R200 = R2,000
  })

  it('declines a transaction that would exceed R2,000', () => {
    const kv = createKv()
    kv.set('daily_spend', 1800)
    const result = beforeTransaction(makeEvent(30000), kv) // R1,800 + R300 = R2,100
    expect(result.approved).toBe(false)
    expect(result.message).toBeTruthy()
  })
})

describe('beforeTransaction — balance tracking', () => {
  it('accumulates spend across multiple approved transactions', () => {
    const kv = createKv()
    beforeTransaction(makeEvent(50000), kv) // R500
    beforeTransaction(makeEvent(50000), kv) // R500
    expect(kv.get('daily_spend')).toBe(1000)
  })

  it('A_S2L5_DECLINED_DOES_NOT_MUTATE_STATE: does NOT update daily_spend when a transaction is declined', () => {
    const kv = createKv()
    kv.set('daily_spend', 1800)
    beforeTransaction(makeEvent(30000), kv) // R300 — declined
    // Store must remain at R1,800, not be updated to R2,100
    expect(kv.get('daily_spend')).toBe(1800)
  })
})
