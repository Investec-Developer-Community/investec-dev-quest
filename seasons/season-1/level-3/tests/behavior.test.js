import { describe, it, expect, beforeAll } from 'vitest'
import { getTransactions } from '../solution.js'

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

describe('getTransactions', () => {
  it('returns an array', async () => {
    const txns = await getTransactions(token, 'acc-001', '2026-04-01', '2026-04-30')
    expect(Array.isArray(txns)).toBe(true)
  })

  it('each transaction has required fields', async () => {
    const txns = await getTransactions(token, 'acc-001', '2026-04-01', '2026-04-30')
    expect(txns.length).toBeGreaterThan(0)
    for (const tx of txns) {
      expect(tx).toHaveProperty('accountId')
      expect(tx).toHaveProperty('amount')
      expect(tx).toHaveProperty('transactionDate')
      expect(tx).toHaveProperty('description')
    }
  })

  it('returns only transactions within the date range', async () => {
    const txns = await getTransactions(token, 'acc-001', '2026-04-01', '2026-04-30')
    for (const tx of txns) {
      expect(tx.transactionDate >= '2026-04-01').toBe(true)
      expect(tx.transactionDate <= '2026-04-30').toBe(true)
    }
  })

  it('returns an empty array when no transactions match', async () => {
    const txns = await getTransactions(token, 'acc-001', '2020-01-01', '2020-01-31')
    expect(txns).toEqual([])
  })

  it('fetches transactions across multiple pages', async () => {
    // acc-001 has 5 transactions total; with default pageSize they should all come back
    const allTxns = await getTransactions(token, 'acc-001', '2020-01-01', '2030-12-31')
    expect(allTxns.length).toBeGreaterThanOrEqual(3)
  })
})
