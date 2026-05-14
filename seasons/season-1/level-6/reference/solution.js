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

async function getAllAccounts(token) {
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

async function getRecentDebitTotal(token, accountId, fromDate, toDate) {
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

  return transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
}

async function validateBeneficiary(token, beneficiaryId) {
  const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/beneficiaries`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  const beneficiaries = json?.data ?? []
  const exists = beneficiaries.some((b) => b.beneficiaryId === beneficiaryId)

  if (!exists) throw new Error('Beneficiary not found')
}

function buildIdempotencyKey(accountId, payment) {
  return createHash('sha256')
    .update(JSON.stringify({ accountId, payment }))
    .digest('hex')
}

async function submitPayment(token, accountId, payment) {
  const idempotencyKey = buildIdempotencyKey(accountId, payment)

  const res = await fetch(`${BASE_URL}/za/pb/v1/accounts/${accountId}/paymultiple`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ paymentList: [payment] }),
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  return json?.data?.TransferResponses?.[0]?.PaymentReferenceNumber
}

export async function runSeasonOneBoss(clientId, clientSecret, accountId, payment, fromDate, toDate) {
  const token = await getToken(clientId, clientSecret)

  const accounts = await getAllAccounts(token)
  const exists = accounts.some((acc) => acc.accountId === accountId)
  if (!exists) throw new Error('Account not found')

  await validateBeneficiary(token, payment.beneficiaryId)
  const recentDebitTotal = await getRecentDebitTotal(token, accountId, fromDate, toDate)
  const paymentReference = await submitPayment(token, accountId, payment)

  return {
    paymentReference,
    recentDebitTotal,
    accountId,
  }
}
