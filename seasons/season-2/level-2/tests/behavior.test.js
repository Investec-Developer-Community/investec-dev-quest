import { describe, it, expect } from 'vitest'
import { beforeTransaction, afterTransaction } from '../solution.js'
import { createKv } from '../kv.js'

function makeEvent(mcc, centsAmount = 10000) {
  return {
    accountNumber: '10011021132',
    dateTime: '2026-04-18T12:00:00',
    centsAmount,
    currencyCode: 'ZAR',
    type: 'card',
    reference: 'ref-001',
    card: { id: 'card-001' },
    merchant: {
      name: 'Test Merchant',
      city: 'Cape Town',
      country: { code: 'ZA', alpha3: 'ZAF', name: 'South Africa' },
      category: { code: String(mcc), name: 'Test' },
    },
  }
}

describe('beforeTransaction — non-food merchants always approved', () => {
  it('approves grocery stores (MCC 5411)', () => {
    const kv = createKv()
    expect(beforeTransaction(makeEvent('5411'), kv).approved).toBe(true)
  })

  it('approves petrol stations (MCC 5541)', () => {
    const kv = createKv()
    expect(beforeTransaction(makeEvent('5541'), kv).approved).toBe(true)
  })

  it('approves clothing stores (MCC 5600)', () => {
    const kv = createKv()
    expect(beforeTransaction(makeEvent('5600'), kv).approved).toBe(true)
  })
})

describe('beforeTransaction — fast-food budget enforcement (MCC 5812)', () => {
  it('approves the first fast-food transaction within budget', () => {
    const kv = createKv()
    const event = makeEvent('5812', 10000) // R100
    expect(beforeTransaction(event, kv).approved).toBe(true)
  })

  it('approves transactions that keep total at exactly R500', () => {
    const kv = createKv()
    kv.set('fastfood_spend', 400) // R400 already spent
    const event = makeEvent('5812', 10000) // +R100 = R500 exactly → still ok
    expect(beforeTransaction(event, kv).approved).toBe(true)
  })

  it('declines a transaction that would exceed R500', () => {
    const kv = createKv()
    kv.set('fastfood_spend', 450) // R450 already spent
    const event = makeEvent('5812', 10000) // +R100 = R550 → over budget
    const result = beforeTransaction(event, kv)
    expect(result.approved).toBe(false)
    expect(result.message).toBeTruthy()
  })
})

describe('afterTransaction — spend accumulation', () => {
  it('increments fastfood_spend for MCC 5812', () => {
    const kv = createKv()
    afterTransaction(makeEvent('5812', 10000), kv) // R100
    expect(kv.get('fastfood_spend')).toBe(100)
  })

  it('accumulates correctly across multiple transactions', () => {
    const kv = createKv()
    afterTransaction(makeEvent('5812', 10000), kv) // R100
    afterTransaction(makeEvent('5812', 5000), kv)  // R50
    expect(kv.get('fastfood_spend')).toBe(150)
  })

  it('does not increment for non-food MCCs', () => {
    const kv = createKv()
    afterTransaction(makeEvent('5411', 10000), kv)
    expect(kv.get('fastfood_spend')).toBeUndefined()
  })
})
