import { describe, it, expect, beforeAll } from 'vitest'
import { getToken, getAccounts, getTotalBalance } from '../solution.js'

const CLIENT_ID = process.env.GAME_API_CLIENT_ID ?? 'game_client_id'
const CLIENT_SECRET = process.env.GAME_API_CLIENT_SECRET ?? 'game_client_secret'

describe('getToken', () => {
  it('returns an access token for valid credentials', async () => {
    const result = await getToken(CLIENT_ID, CLIENT_SECRET)
    expect(result).toHaveProperty('access_token')
    expect(typeof result.access_token).toBe('string')
    expect(result.access_token.length).toBeGreaterThan(0)
  })

  it('returns expires_in as a number', async () => {
    const result = await getToken(CLIENT_ID, CLIENT_SECRET)
    expect(typeof result.expires_in).toBe('number')
  })

  it('throws "Authentication failed" for invalid credentials', async () => {
    await expect(getToken('bad_id', 'bad_secret')).rejects.toThrow('Authentication failed')
  })
})

describe('getAccounts', () => {
  let token

  beforeAll(async () => {
    const result = await getToken(CLIENT_ID, CLIENT_SECRET)
    token = result.access_token
  })

  it('returns an array of accounts', async () => {
    const accounts = await getAccounts(token)
    expect(Array.isArray(accounts)).toBe(true)
    expect(accounts.length).toBeGreaterThan(0)
  })

  it('returns all accounts — pagination must be followed', async () => {
    const accounts = await getAccounts(token)
    // The mock API has 2 accounts; a pageSize=1 should still return 2 total
    expect(accounts.length).toBe(2)
  })

  it('each account has required fields', async () => {
    const accounts = await getAccounts(token)
    for (const acc of accounts) {
      expect(acc).toHaveProperty('accountId')
      expect(acc).toHaveProperty('accountNumber')
      expect(acc).toHaveProperty('accountName')
    }
  })

  it('throws or rejects on invalid token', async () => {
    await expect(getAccounts('invalid_token')).rejects.toThrow()
  })
})

describe('getTotalBalance', () => {
  let token

  beforeAll(async () => {
    const result = await getToken(CLIENT_ID, CLIENT_SECRET)
    token = result.access_token
  })

  it('returns the correct total balance', async () => {
    // acc-001: 50000.00, acc-002: 25000.50 → total: 75000.50
    const total = await getTotalBalance(token)
    expect(total).toBeCloseTo(75000.5, 2)
  })

  it('returns a number', async () => {
    const total = await getTotalBalance(token)
    expect(typeof total).toBe('number')
  })
})
