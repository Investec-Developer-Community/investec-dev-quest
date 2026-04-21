const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const HARDCODED_CLIENT_ID = 'game_client_id'
const HARDCODED_CLIENT_SECRET = 'game_client_secret'

export async function getToken(clientId, clientSecret) {
  throw new Error('Not implemented')
}

export async function getAccounts(token) {
  throw new Error('Not implemented')
}

export async function getTotalBalance(token) {
  throw new Error('Not implemented')
}

