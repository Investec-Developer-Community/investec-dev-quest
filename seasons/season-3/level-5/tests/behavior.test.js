import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { GENESIS_HASH, processWebhook } from '../solution.js'

const SECRET = 'whsec_month_end_settlement'
const NOW = 1_714_000_000

function makeContext() {
  return {
    secret: SECRET,
    nowSeconds: NOW,
    seenDeliveryIds: new Set(),
    allowedCallbackHosts: ['hooks.finflow.co.za'],
    auditLog: [],
  }
}

function signedRequest(deliveryId, body, { timestamp = String(NOW), secret = SECRET } = {}) {
  const rawBody = typeof body === 'string' ? body : JSON.stringify(body)
  const digest = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  return {
    headers: {
      'x-investec-delivery-id': deliveryId,
      'x-investec-timestamp': timestamp,
      'x-investec-signature': `sha256=${digest}`,
    },
    rawBody,
  }
}

const SETTLEMENT = { event: 'settlement.completed', amount: 125000, currency: 'ZAR' }

describe('processWebhook — accepted deliveries', () => {
  it('accepts a fresh, correctly signed delivery and records its id', () => {
    const context = makeContext()
    const result = processWebhook(signedRequest('dlv_100', SETTLEMENT), context)
    expect(result.status).toBe('accepted')
    expect(context.seenDeliveryIds.has('dlv_100')).toBe(true)
  })

  it('accepts an allowlisted callback URL', () => {
    const context = makeContext()
    const body = { ...SETTLEMENT, callbackUrl: 'https://hooks.finflow.co.za/settlements' }
    expect(processWebhook(signedRequest('dlv_101', body), context).status).toBe('accepted')
  })

  it('chains accepted decisions in the audit log', () => {
    const context = makeContext()
    processWebhook(signedRequest('dlv_102', SETTLEMENT), context)
    processWebhook(signedRequest('dlv_103', SETTLEMENT), context)
    expect(context.auditLog).toHaveLength(2)
    expect(context.auditLog[0].prevHash).toBe(GENESIS_HASH)
    expect(context.auditLog[1].prevHash).toBe(context.auditLog[0].hash)
    expect(context.auditLog[1].event).toMatchObject({ deliveryId: 'dlv_103', status: 'accepted' })
  })
})

describe('processWebhook — rejected deliveries', () => {
  it('rejects a tampered body', () => {
    const context = makeContext()
    const request = signedRequest('dlv_200', SETTLEMENT)
    request.rawBody = JSON.stringify({ ...SETTLEMENT, amount: 1 })
    expect(processWebhook(request, context).status).toBe('rejected')
  })

  it('records rejected decisions in the audit log with a reason', () => {
    const context = makeContext()
    const request = signedRequest('dlv_201', SETTLEMENT)
    request.rawBody = JSON.stringify({ ...SETTLEMENT, amount: 1 })
    const result = processWebhook(request, context)

    expect(context.auditLog).toHaveLength(1)
    expect(context.auditLog[0].event).toMatchObject({ deliveryId: 'dlv_201', status: 'rejected', reason: result.reason })
    expect(typeof result.reason).toBe('string')
  })

  it('does not let a forged request burn a genuine delivery id', () => {
    const context = makeContext()
    const forged = signedRequest('dlv_202', SETTLEMENT, { secret: 'wrong-secret' })
    expect(processWebhook(forged, context).status).toBe('rejected')

    const genuine = signedRequest('dlv_202', SETTLEMENT)
    expect(processWebhook(genuine, context).status).toBe('accepted')
  })

  it('rejects a duplicate delivery id', () => {
    const context = makeContext()
    expect(processWebhook(signedRequest('dlv_203', SETTLEMENT), context).status).toBe('accepted')
    expect(processWebhook(signedRequest('dlv_203', SETTLEMENT), context).status).toBe('rejected')
  })

  it('rejects a correctly signed body that is not JSON', () => {
    const context = makeContext()
    expect(processWebhook(signedRequest('dlv_204', 'settlement=done'), context).status).toBe('rejected')
  })
})
