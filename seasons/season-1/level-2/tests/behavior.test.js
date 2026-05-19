import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { getToken, apiFetch } from '../solution.js'

const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const CLIENT_ID = process.env.GAME_API_CLIENT_ID ?? 'game_client_id'
const CLIENT_SECRET = process.env.GAME_API_CLIENT_SECRET ?? 'game_client_secret'
let realFetch

beforeAll(() => {
  realFetch = globalThis.fetch
})

afterEach(() => {
  vi.restoreAllMocks()
})

function countTokenRequests() {
  let count = 0
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url ?? ''
    if (url.includes('/identity/v2/oauth2/token')) count += 1
    return realFetch(input, init)
  })
  return () => count
}

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

  it('A_S1L2_REUSES_VALID_TOKEN: does not fetch a new token for every request', async () => {
    const tokenRequests = countTokenRequests()

    await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)
    await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)

    expect(tokenRequests()).toBe(0)
  })

  it('throws "Request failed: 404" for a missing resource', async () => {
    await expect(
      apiFetch(`${BASE_URL}/za/pb/v1/accounts/does-not-exist/balance`, tokenStore)
    ).rejects.toThrow('Request failed: 404')
  })
})

describe('apiFetch — token refresh', () => {
  it('A_S1L2_REFRESHES_EXPIRED_CACHE: refreshes before a request when expiresAt is in the past', async () => {
    const tokenStore = {
      token: 'expired_cached_token',
      expiresAt: Date.now() - 1000,
    }

    const tokenRequests = countTokenRequests()
    const data = await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)

    expect(data).toHaveProperty('data')
    expect(tokenRequests()).toBe(1)
    expect(tokenStore.token).not.toBe('expired_cached_token')
    expect(tokenStore.expiresAt).toBeGreaterThan(Date.now())
  })

  it('A_S1L2_RETRY_ON_401_ONCE: automatically refreshes an expired token and returns data', async () => {
    const tokenStore = { token: 'stale_or_missing_token' }

    // apiFetch must recover transparently
    const data = await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)
    expect(data).toHaveProperty('data')

    // tokenStore must have the new token
    expect(tokenStore.token).not.toBe('stale_or_missing_token')
    expect(tokenStore.expiresAt).toBeGreaterThan(Date.now())
  })

  it('A_S1L2_UPDATES_TOKEN_STORE: updates tokenStore.token after a successful refresh', async () => {
    const tokenStore = { token: 'stale_or_missing_token' }
    await apiFetch(`${BASE_URL}/za/pb/v1/accounts`, tokenStore)
    expect(typeof tokenStore.token).toBe('string')
    expect(tokenStore.token).not.toBe('stale_or_missing_token')
    expect(typeof tokenStore.expiresAt).toBe('number')
  })

  it('A_S1L2_BOUNDED_RETRY: throws "Token refresh failed" when credentials are removed from env', async () => {
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
