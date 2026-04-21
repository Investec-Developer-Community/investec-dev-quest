const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const API_KEY = process.env.GAME_API_KEY ?? 'game_api_key'

export async function getToken(clientId, clientSecret) {
  const res = await fetch(`${BASE_URL}/identity/v2/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'x-api-key': API_KEY,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }).toString(),
  })

  if (!res.ok) throw new Error('Authentication failed')
  return res.json()
}

async function fetchWithToken(url, token) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function apiFetch(url, tokenStore) {
  const first = await fetchWithToken(url, tokenStore.token)

  if (first.ok) return first.json()
  if (first.status !== 401) throw new Error(`Request failed: ${first.status}`)

  try {
    const clientId = process.env.GAME_API_CLIENT_ID
    const clientSecret = process.env.GAME_API_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Missing credentials')

    const refreshed = await getToken(clientId, clientSecret)
    tokenStore.token = refreshed.access_token
  } catch {
    throw new Error('Token refresh failed')
  }

  const second = await fetchWithToken(url, tokenStore.token)
  if (!second.ok) throw new Error(`Request failed: ${second.status}`)
  return second.json()
}
