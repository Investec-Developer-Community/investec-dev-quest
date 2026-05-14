import { createHash } from 'crypto'

const BASE_URL = process.env.GAME_API_BASE_URL ?? 'http://localhost:3001'
const API_KEY = process.env.GAME_API_KEY ?? 'game_api_key'

async function getToken(clientId, clientSecret) {
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
  const json = await res.json()
  return json.access_token
}

async function getAccount(token, accountId) {
  const url = new URL(`${BASE_URL}/za/pb/v1/accounts`)
  url.searchParams.set('pageSize', '1')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  const firstPage = json?.data?.accounts ?? []
  return firstPage.find((acc) => acc.accountId === accountId) ?? null
}

async function getRecentDebitTotal(token, accountId) {
  const url = new URL(`${BASE_URL}/za/pb/v1/accounts/${accountId}/transactions`)
  url.searchParams.set('pageSize', '2')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  const txs = json?.data?.transactions ?? []

  return txs
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
}

function buildIdempotencyKey(payment) {
  return createHash('sha256').update(JSON.stringify(payment)).digest('hex')
}

async function submitPayment(token, accountId, payment) {
  const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/${accountId}/paymultiple`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      // bug: key is computed but not sent
    },
    body: JSON.stringify({
      paymentList: [payment],
      idempotencyKey: buildIdempotencyKey(payment),
    }),
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  return json?.data?.TransferResponses?.[0]?.PaymentReferenceNumber
}

export async function runSeasonOneBoss(clientId, clientSecret, accountId, payment, fromDate, toDate) {
  const token = await getToken(clientId, clientSecret)

  const account = await getAccount(token, accountId)
  if (!account) throw new Error('Account not found')

  // bug: missing beneficiary validation
  const recentDebitTotal = await getRecentDebitTotal(token, accountId, fromDate, toDate)
  const paymentReference = await submitPayment(token, accountId, payment)

  return {
    paymentReference,
    recentDebitTotal,
    accountId,
  }
}
