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
  const clientId = process.env.GAME_API_CLIENT_ID ?? 'game_client_id'
  const clientSecret = process.env.GAME_API_CLIENT_SECRET ?? 'game_client_secret'
  const freshToken = await getToken(clientId, clientSecret)
  tokenStore.token = freshToken.access_token
  tokenStore.expiresAt = Date.now() + freshToken.expires_in * 1000

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenStore.token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}
