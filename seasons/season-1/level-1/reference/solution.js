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

  if (!res.ok) {
    throw new Error('Authentication failed')
  }

  return res.json()
}

export async function getAccounts(token) {
  const accounts = []
  let cursor = null

  do {
    const url = new URL(`${BASE_URL}/za/pb/v1/accounts`)
    url.searchParams.set('pageSize', '1')
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)

    const json = await res.json()
    accounts.push(...(json?.data?.accounts ?? []))
    cursor = json?.meta?.nextCursor ?? null
  } while (cursor !== null)

  return accounts
}

export async function getTotalBalance(token) {
  const accounts = await getAccounts(token)
  const balances = await Promise.all(
    accounts.map(async (account) => {
      const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/${account.accountId}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json = await res.json()
      return json?.data?.currentBalance ?? 0
    })
  )

  return balances.reduce((sum, value) => sum + value, 0)
}
