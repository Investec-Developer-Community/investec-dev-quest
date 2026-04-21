import { describe, it, expect, beforeAll } from 'vitest'
import { getBeneficiaries, validateBeneficiary } from '../solution.js'

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

describe('getBeneficiaries', () => {
  it('returns an array of beneficiaries', async () => {
    const bens = await getBeneficiaries(token)
    expect(Array.isArray(bens)).toBe(true)
    expect(bens.length).toBe(3)
  })

  it('each beneficiary has required fields', async () => {
    const bens = await getBeneficiaries(token)
    for (const b of bens) {
      expect(b).toHaveProperty('beneficiaryId')
      expect(b).toHaveProperty('beneficiaryName')
      expect(b).toHaveProperty('accountNumber')
    }
  })
})

describe('validateBeneficiary', () => {
  it('returns true for a valid beneficiary ID', async () => {
    const result = await validateBeneficiary(token, 'ben-001')
    expect(result).toBe(true)
  })

  it('throws "Beneficiary not found" for an ID that does not exist', async () => {
    await expect(validateBeneficiary(token, 'ben-999')).rejects.toThrow('Beneficiary not found')
  })
})
