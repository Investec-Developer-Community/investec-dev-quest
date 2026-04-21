const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'

export async function getTransactions(token, accountId, fromDate, toDate) {
  const transactions = []
  let cursor = null

  do {
    const url = new URL(`${BASE_URL}/za/pb/v1/accounts/${accountId}/transactions`)
    url.searchParams.set('pageSize', '2')
    if (fromDate) url.searchParams.set('fromDate', fromDate)
    if (toDate) url.searchParams.set('toDate', toDate)
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)

    const json = await res.json()
    transactions.push(...(json?.data?.transactions ?? []))
    cursor = json?.meta?.nextCursor ?? null
  } while (cursor !== null)

  return transactions.filter((tx) => {
    const d = tx.transactionDate
    if (fromDate && d < fromDate) return false
    if (toDate && d > toDate) return false
    return true
  })
}

