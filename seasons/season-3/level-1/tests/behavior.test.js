import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyWebhook } from '../solution.js'

const SECRET = 'whsec_test_abc123'
const BODY = JSON.stringify({ event: 'payment.created', amount: 2500, currency: 'ZAR' })
const TIMESTAMP = '1713510000'

function sign(body = BODY, timestamp = TIMESTAMP, secret = SECRET) {
  const digest = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')
  return `sha256=${digest}`
}

describe('verifyWebhook — valid signatures', () => {
  it('returns true for a valid signature', () => {
    const headers = {
      'x-investec-timestamp': TIMESTAMP,
      'x-investec-signature': sign(),
    }
    expect(verifyWebhook(headers, BODY, SECRET)).toBe(true)
  })
})

describe('verifyWebhook — invalid signatures', () => {
  it('returns false when body is modified', () => {
    const headers = {
      'x-investec-timestamp': TIMESTAMP,
      'x-investec-signature': sign(),
    }
    const tamperedBody = JSON.stringify({ event: 'payment.created', amount: 9999, currency: 'ZAR' })
    expect(verifyWebhook(headers, tamperedBody, SECRET)).toBe(false)
  })

  it('returns false when signature header is missing', () => {
    const headers = {
      'x-investec-timestamp': TIMESTAMP,
    }
    expect(verifyWebhook(headers, BODY, SECRET)).toBe(false)
  })

  it('returns false when signature scheme is not sha256', () => {
    const headers = {
      'x-investec-timestamp': TIMESTAMP,
      'x-investec-signature': sign().replace('sha256=', 'md5='),
    }
    expect(verifyWebhook(headers, BODY, SECRET)).toBe(false)
  })

  it('returns false for truncated signatures (must be full length)', () => {
    const full = sign()
    const truncated = `sha256=${full.slice('sha256='.length, 'sha256='.length + 12)}`
    const headers = {
      'x-investec-timestamp': TIMESTAMP,
      'x-investec-signature': truncated,
    }
    expect(verifyWebhook(headers, BODY, SECRET)).toBe(false)
  })
})
