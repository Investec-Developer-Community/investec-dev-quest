const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'

export async function getTransactions(token, accountId, fromDate, toDate) {
  const url = new URL(`${BASE_URL}/za/pb/v1/accounts/${accountId}/transactions`)
  url.searchParams.set('pageSize', '10')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)

  const json = await res.json()
  return json?.data?.transactions ?? []
}

