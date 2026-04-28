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
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
  })

  if (!res.ok) throw new Error('Authentication failed')
  return res.json()
}

export async function apiFetch(url, tokenStore) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenStore.token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

