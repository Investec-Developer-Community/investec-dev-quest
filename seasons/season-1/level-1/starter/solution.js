const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const API_KEY = process.env.GAME_API_KEY ?? 'game_api_key'
const HARDCODED_CLIENT_ID = 'game_client_id'
const HARDCODED_CLIENT_SECRET = 'game_client_secret'

export async function getToken(clientId, clientSecret) {
  const res = await fetch(`${BASE_URL}/identity/v2/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${HARDCODED_CLIENT_ID}:${HARDCODED_CLIENT_SECRET}`).toString('base64')}`,
      'x-api-key': API_KEY,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
  })

  if (!res.ok) throw new Error('Authentication failed')
  return res.json()
}

export async function getAccounts(token) {
  const res = await fetch(`${BASE_URL}/za/pb/v1/accounts?pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  return json?.data?.accounts ?? []
}

export async function getTotalBalance(token) {
  const accounts = await getAccounts(token)
  let total = 0
  for (const account of accounts) {
    const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/${account.accountId}/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const json = await res.json()
    total += json?.data?.currentBalance ?? 0
  }
  return total
}

