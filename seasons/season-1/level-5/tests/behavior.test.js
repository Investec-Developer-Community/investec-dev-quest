import { describe, it, expect, beforeAll } from 'vitest'
import { submitPayment } from '../solution.js'

const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const CLIENT_ID = process.env.GAME_API_CLIENT_ID ?? 'game_client_id'
const CLIENT_SECRET = process.env.GAME_API_CLIENT_SECRET ?? 'game_client_secret'
const API_KEY = process.env.GAME_API_KEY ?? 'game_api_key'

let token

beforeAll(async () => {
  const res = await fetch(`${BASE_URL}/identity/v2/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'x-api-key': API_KEY,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }).toString(),
  })
  const data = await res.json()
  token = data.access_token
})

const PAYMENT = {
  beneficiaryId: 'ben-001',
  amount: 500.0,
  myReference: 'Invoice 1042',
  theirReference: 'Payment from J Soap',
}

describe('submitPayment', () => {
  it('returns transfer responses with status ACCEPTED', async () => {
    const result = await submitPayment(token, 'acc-001', PAYMENT)
    const transfer = result?.data?.TransferResponses?.[0]
    expect(transfer).toHaveProperty('PaymentReferenceNumber')
    expect(transfer.status).toBe('ACCEPTED')
    expect(transfer.amount).toBe(500.0)
  })

  it('returns a PaymentReferenceNumber string', async () => {
    const result = await submitPayment(token, 'acc-001', PAYMENT)
    const transfer = result?.data?.TransferResponses?.[0]
    expect(typeof transfer.PaymentReferenceNumber).toBe('string')
    expect(transfer.PaymentReferenceNumber.length).toBeGreaterThan(0)
  })

  it('two calls with the same payment return the same PaymentReferenceNumber', async () => {
    const r1 = await submitPayment(token, 'acc-001', PAYMENT)
    const r2 = await submitPayment(token, 'acc-001', PAYMENT)
    expect(r1.data.TransferResponses[0].PaymentReferenceNumber).toBe(
      r2.data.TransferResponses[0].PaymentReferenceNumber
    )
  })

  it('different payment amounts produce different PaymentReferenceNumbers', async () => {
    const r1 = await submitPayment(token, 'acc-001', { ...PAYMENT, amount: 100 })
    const r2 = await submitPayment(token, 'acc-001', { ...PAYMENT, amount: 200 })
    expect(r1.data.TransferResponses[0].PaymentReferenceNumber).not.toBe(
      r2.data.TransferResponses[0].PaymentReferenceNumber
    )
  })
})
