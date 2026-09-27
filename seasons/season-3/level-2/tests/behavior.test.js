import { describe, it, expect } from 'vitest'
import { acceptDelivery } from '../solution.js'

const NOW = 1_713_510_000

function headers(deliveryId, timestamp = String(NOW)) {
  return {
    'x-investec-delivery-id': deliveryId,
    'x-investec-timestamp': timestamp,
  }
}

describe('acceptDelivery — fresh deliveries', () => {
  it('accepts a fresh delivery with a new delivery id', () => {
    const seen = new Set()
    expect(acceptDelivery(headers('dlv_001'), NOW, seen).accepted).toBe(true)
  })

  it('accepts a delivery signed two minutes ago (inside the window)', () => {
    const seen = new Set()
    expect(acceptDelivery(headers('dlv_002', String(NOW - 120)), NOW, seen).accepted).toBe(true)
  })

  it('records accepted delivery ids in the seen set', () => {
    const seen = new Set()
    acceptDelivery(headers('dlv_003'), NOW, seen)
    expect(seen.has('dlv_003')).toBe(true)
  })
})

describe('acceptDelivery — rejections', () => {
  it('rejects the same delivery id the second time it arrives', () => {
    const seen = new Set()
    expect(acceptDelivery(headers('dlv_004'), NOW, seen).accepted).toBe(true)
    const second = acceptDelivery(headers('dlv_004'), NOW + 5, seen)
    expect(second.accepted).toBe(false)
    expect(typeof second.reason).toBe('string')
  })

  it('rejects deliveries with missing headers', () => {
    const seen = new Set()
    expect(acceptDelivery({ 'x-investec-timestamp': String(NOW) }, NOW, seen).accepted).toBe(false)
    expect(acceptDelivery({ 'x-investec-delivery-id': 'dlv_005' }, NOW, seen).accepted).toBe(false)
  })
})
