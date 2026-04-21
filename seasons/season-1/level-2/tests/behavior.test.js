import { describe, it, expect, beforeAll } from 'vitest'
import { getToken, apiFetch } from '../solution.js'

const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const CLIENT_ID = process.env.GAME_API_CLIENT_ID ?? 'game_client_id'
const CLIENT_SECRET = process.env.GAME_API_CLIENT_SECRET ?? 'game_client_secret'

describe('getToken', () => {
  it('returns an access token for valid credentials', async () => {
    const result = await getToken(CLIENT_ID, CLIENT_SECRET)
    expect(result).toHaveProperty('access_token')
    expect(typeof result.access_token).toBe('string')
  })

  it('throws "Authentication failed" for bad credentials', async () => {
    await expect(getToken('bad', 'creds')).rejects.toThrow('Authentication failed')
  })
})

describe('apiFetch — normal path', () => {
  let tokenStore

  beforeAll(async () => {
    const result = await getToken(CLIENT_ID, CLIENT_SECRET)
    tokenStore = { token: result.access_token }
  })

  it('returns JSON for a valid authenticated request', async () => {
    const data = await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('accounts')
  })

  it('throws "Request failed: 404" for a missing resource', async () => {
    await expect(
      apiFetch(`${BASE_URL}/za/pb/v1/accounts/does-not-exist/balance`, tokenStore)
    ).rejects.toThrow('Request failed: 404')
  })
})

describe('apiFetch — token refresh', () => {
  it('automatically refreshes an expired token and returns data', async () => {
    const tokenStore = { token: 'stale_or_missing_token' }

    // apiFetch must recover transparently
    const data = await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)
    expect(data).toHaveProperty('data')

    // tokenStore must have the new token
    expect(tokenStore.token).not.toBe('stale_or_missing_token')
  })

  it('throws "Token refresh failed" when credentials are removed from env', async () => {
    // Temporarily corrupt credentials so refresh fails
    const orig = process.env.GAME_API_CLIENT_ID
    process.env.GAME_API_CLIENT_ID = 'invalid_id'

    try {
      const tokenStore = { token: 'stale_or_missing_token' }
      await expect(
        apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)
      ).rejects.toThrow()
    } finally {
      process.env.GAME_API_CLIENT_ID = orig
    }
  })
})
