const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'

export async function getToken(clientId, clientSecret) {
  throw new Error('Not implemented')
}

export async function apiFetch(url, tokenStore) {
  throw new Error('Not implemented')
}

