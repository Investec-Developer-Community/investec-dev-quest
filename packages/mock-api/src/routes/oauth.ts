import { Hono } from 'hono'

// Valid game credentials — never use real credentials here
const VALID_CLIENT_ID = process.env['GAME_API_CLIENT_ID'] ?? 'game_client_id'
const VALID_CLIENT_SECRET = process.env['GAME_API_CLIENT_SECRET'] ?? 'game_client_secret'
const VALID_API_KEY = process.env['GAME_API_KEY'] ?? 'game_api_key'

// Simple in-memory token store (no persistence needed — it's a local game)
const validTokens = new Map<string, number>()
let tokenCounter = 0

export function isValidToken(token: string): boolean {
  const expiresAt = validTokens.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    validTokens.delete(token)
    return false
  }
  return true
}

export const oauthRouter = new Hono()

function parseBasicAuth(header: string | undefined): { clientId: string; clientSecret: string } | null {
  if (!header || !header.startsWith('Basic ')) return null

  const encoded = header.slice(6).trim()
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const separatorIndex = decoded.indexOf(':')
  if (separatorIndex === -1) return null

  return {
    clientId: decoded.slice(0, separatorIndex),
    clientSecret: decoded.slice(separatorIndex + 1),
  }
}

// POST /identity/v2/oauth2/token
oauthRouter.post('/token', async (c) => {
  const body = await c.req.parseBody()
  const grantType = body['grant_type']
  const apiKey = c.req.header('x-api-key')
  const basicAuth = parseBasicAuth(c.req.header('Authorization'))

  if (grantType !== 'client_credentials') {
    return c.json({ error: 'unsupported_grant_type' }, 400)
  }

  if (apiKey !== VALID_API_KEY) {
    return c.json({ error: 'invalid_api_key' }, 401)
  }

  if (!basicAuth) {
    return c.json({ error: 'invalid_client' }, 401)
  }

  if (basicAuth.clientId !== VALID_CLIENT_ID || basicAuth.clientSecret !== VALID_CLIENT_SECRET) {
    return c.json({ error: 'invalid_client' }, 401)
  }

  tokenCounter += 1
  const token = `game_token_${tokenCounter}_${Date.now()}`

  // Tokens expire after 30 minutes by default. Override only for explicit tests/demos.
  const configuredExpiresIn = parseInt(process.env['GAME_API_TOKEN_TTL_SECONDS'] ?? '1800', 10)
  const expiresIn = Number.isFinite(configuredExpiresIn) && configuredExpiresIn > 0
    ? configuredExpiresIn
    : 1800
  validTokens.set(token, Date.now() + expiresIn * 1000)

  return c.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresIn,
    scope: 'accounts',
  })
})
