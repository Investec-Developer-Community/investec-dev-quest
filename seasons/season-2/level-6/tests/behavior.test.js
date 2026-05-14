import { describe, it, expect } from 'vitest'
import { beforeTransaction, afterTransaction } from '../solution.js'
import { createKv } from '../kv.js'

function makeEvent({
  mcc = '5411',
  country = 'ZA',
  centsAmount = 10000,
  dateTime = '2026-04-18T10:00:00.000Z',
} = {}) {
  return {
    accountNumber: '10011021132',
    dateTime,
    centsAmount,
    currencyCode: 'ZAR',
    type: 'card',
    reference: 'ref-001',
    card: { id: 'card-001' },
    merchant: {
      name: 'Test Store',
      city: 'Cape Town',
      country: { code: country, alpha3: 'ZAF', name: 'South Africa' },
      category: { code: String(mcc), name: 'Test' },
    },
  }
}

function offsetTime(baseIso, offsetSeconds) {
  return new Date(new Date(baseIso).getTime() + offsetSeconds * 1000).toISOString()
}

describe('beforeTransaction — policy gates', () => {
  it('declines restricted MCC even when event code is a string', () => {
    const kv = createKv()
    const result = beforeTransaction(makeEvent({ mcc: '7995' }), kv)
    expect(result.approved).toBe(false)
  })

  it('approves allowed country in lowercase form', () => {
    const kv = createKv()
    const result = beforeTransaction(makeEvent({ country: 'za' }), kv)
    expect(result.approved).toBe(true)
  })

  it('declines a non-allowlisted country', () => {
    const kv = createKv()
    const result = beforeTransaction(makeEvent({ country: 'GB' }), kv)
    expect(result.approved).toBe(false)
  })
})

describe('beforeTransaction — velocity and spend controls', () => {
  it('declines the 4th transaction inside 60 seconds', () => {
    const kv = createKv()
    const base = '2026-04-18T10:00:00.000Z'

    expect(beforeTransaction(makeEvent({ dateTime: base }), kv).approved).toBe(true)
    expect(beforeTransaction(makeEvent({ dateTime: offsetTime(base, 1) }), kv).approved).toBe(true)
    expect(beforeTransaction(makeEvent({ dateTime: offsetTime(base, 2) }), kv).approved).toBe(true)

    const fourth = beforeTransaction(makeEvent({ dateTime: offsetTime(base, 3) }), kv)
    expect(fourth.approved).toBe(false)
  })

  it('does not mutate daily_spend when over-limit transaction is declined', () => {
    const kv = createKv()
    kv.set('daily_spend', 1950)

    const declined = beforeTransaction(makeEvent({ centsAmount: 10000 }), kv)
    expect(declined.approved).toBe(false)
    expect(kv.get('daily_spend')).toBe(1950)
  })

  it('enforces the R500 fast-food budget for MCC 5812', () => {
    const kv = createKv()
    kv.set('fastfood_spend', 480)

    const result = beforeTransaction(makeEvent({ mcc: '5812', centsAmount: 5000 }), kv)
    expect(result.approved).toBe(false)
  })
})

describe('afterTransaction — category-aware state updates', () => {
  it('increments fastfood_spend for MCC 5812 only', () => {
    const kv = createKv()

    const approvedFastFood = beforeTransaction(makeEvent({ mcc: '5812', centsAmount: 10000 }), kv)
    expect(approvedFastFood.approved).toBe(true)
    afterTransaction(makeEvent({ mcc: '5812', centsAmount: 10000 }), kv)
    expect(kv.get('fastfood_spend')).toBe(100)

    const approvedGrocery = beforeTransaction(makeEvent({ mcc: '5411', centsAmount: 10000 }), kv)
    expect(approvedGrocery.approved).toBe(true)
    afterTransaction(makeEvent({ mcc: '5411', centsAmount: 10000 }), kv)

    expect(kv.get('fastfood_spend')).toBe(100)
  })
})
