import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { isValidToken, oauthRouter } from './routes/oauth.js'
import { accountsRouter } from './routes/accounts.js'
import { TRANSACTIONS, PAYMENT_CACHE, paginate } from './data/fixtures.js'
import { randomUUID } from 'crypto'

const PORT = parseInt(process.env['GAME_API_PORT'] ?? '3001', 10)
const DEBUG = process.env['GAME_API_DEBUG'] === '1' || process.env['GAME_API_DEBUG'] === 'true'
const LATENCY_MS = parseInt(process.env['GAME_API_LATENCY_MS'] ?? '0', 10)
const ERROR_RATE = Number(process.env['GAME_API_ERROR_RATE'] ?? '0')

const app = new Hono()

// Optional local-only realism knobs for demos and resilience levels. Defaults are deterministic.
app.use('*', async (c, next) => {
  const startedAt = Date.now()
  const safeLatency = Number.isFinite(LATENCY_MS) && LATENCY_MS > 0 ? LATENCY_MS : 0
  const safeErrorRate = Number.isFinite(ERROR_RATE) && ERROR_RATE > 0 ? Math.min(ERROR_RATE, 1) : 0

  if (safeLatency > 0) {
    await new Promise((resolve) => setTimeout(resolve, safeLatency))
  }

  if (safeErrorRate > 0 && c.req.path !== '/health' && Math.random() < safeErrorRate) {
    if (DEBUG) console.log(`${c.req.method} ${c.req.path} -> 503 simulated`)
    return c.json({ error: 'simulated_upstream_failure' }, 503)
  }

  await next()

  if (DEBUG) {
    console.log(`${c.req.method} ${c.req.path} -> ${c.res.status} (${Date.now() - startedAt}ms)`)
  }
})

// ─── Auth middleware ─────────────────────────────────────────────────────────

app.use('/za/*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (!isValidToken(token)) {
    return c.json({ error: 'unauthorized', message: 'Missing or invalid Bearer token' }, 401)
  }

  await next()
})

// ─── Routes ──────────────────────────────────────────────────────────────────

app.route('/identity/v2/oauth2', oauthRouter)
app.route('/za/pb/v1/accounts', accountsRouter)

function shouldIncludePending(includePending: string | undefined): boolean {
  return includePending === 'true' || includePending === '1'
}

// GET /za/pb/v1/accounts/:accountId/transactions
// Defined directly on the app so :accountId is in scope and fully typed.
app.get('/za/pb/v1/accounts/:accountId/transactions', (c) => {
  const { accountId } = c.req.param()
  const cursor = c.req.query('cursor') ?? null
  const pageSize = parseInt(c.req.query('pageSize') ?? '10', 10)
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10
  const fromDate = c.req.query('fromDate') ?? null   // YYYY-MM-DD
  const toDate = c.req.query('toDate') ?? null       // YYYY-MM-DD
  const transactionType = c.req.query('transactionType') ?? null
  const includePending = shouldIncludePending(c.req.query('includePending'))

  let all = (TRANSACTIONS[accountId] ?? []).filter((tx) => includePending || tx.status !== 'PENDING')

  // Apply date range filter when provided
  if (fromDate || toDate) {
    all = all.filter((tx) => {
      const d = tx.transactionDate
      if (fromDate && d < fromDate) return false
      if (toDate && d > toDate) return false
      return true
    })
  }

  if (transactionType) {
    all = all.filter((tx) => tx.transactionType === transactionType)
  }

  const { page, nextCursor } = paginate(all, cursor, safePageSize)

  return c.json({
    data: { transactions: page },
    links: {
      self: `/za/pb/v1/accounts/${accountId}/transactions`,
      ...(nextCursor
        ? { next: `/za/pb/v1/accounts/${accountId}/transactions?cursor=${nextCursor}` }
        : {}),
    },
    meta: {
      count: page.length,
      totalCount: all.length,
      pageSize: safePageSize,
      totalPages: Math.ceil(all.length / safePageSize),
      nextCursor,
    },
  })
})

// GET /za/pb/v1/accounts/:accountId/pending-transactions
app.get('/za/pb/v1/accounts/:accountId/pending-transactions', (c) => {
  const { accountId } = c.req.param()
  const transactions = (TRANSACTIONS[accountId] ?? []).filter((tx) => tx.status === 'PENDING')

  return c.json({
    data: { transactions },
    links: { self: `/za/pb/v1/accounts/${accountId}/pending-transactions` },
    meta: { count: transactions.length },
  })
})

// POST /za/pb/v1/accounts/:accountId/paymultiple
// Supports Idempotency-Key header — duplicate keys return the cached response.
app.post('/za/pb/v1/accounts/:accountId/paymultiple', async (c) => {
  const { accountId } = c.req.param()
  const idempotencyKey = c.req.header('Idempotency-Key') ?? null
  const cacheKey = idempotencyKey ? `${accountId}:${idempotencyKey}` : null

  if (cacheKey && PAYMENT_CACHE.has(cacheKey)) {
    return c.json(PAYMENT_CACHE.get(cacheKey))
  }

  const body = await c.req.json().catch(() => null)
  const paymentList = body?.paymentList
  if (!Array.isArray(paymentList) || paymentList.length === 0) {
    return c.json({ error: 'Invalid payment request' }, 400)
  }

  const invalidPayment = paymentList.find(
    (payment) =>
      !payment ||
      typeof payment.beneficiaryId !== 'string' ||
      !payment.beneficiaryId ||
      !['string', 'number'].includes(typeof payment.amount)
  )

  if (invalidPayment) {
    return c.json({ error: 'Invalid payment request' }, 400)
  }

  const transferResponses = paymentList.map((payment: { amount: string | number; beneficiaryId: string }) => ({
    PaymentReferenceNumber: randomUUID(),
    beneficiaryId: payment.beneficiaryId,
    amount: Number(payment.amount),
    status: 'ACCEPTED',
  }))

  const response = {
    data: {
      TransferResponses: transferResponses,
    },
    links: { self: `/za/pb/v1/accounts/${accountId}/paymultiple` },
    meta: { count: transferResponses.length },
  }

  if (cacheKey) {
    PAYMENT_CACHE.set(cacheKey, response)
  }

  return c.json(response, 200)
})

// ─── Health check ────────────────────────────────────────────────────────────

app.get('/health', (c) => c.json({ status: 'ok', service: 'investec-mock-api' }))

// ─── Start ───────────────────────────────────────────────────────────────────

const server = serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Mock Investec API running on http://localhost:${PORT}`)
})

process.on('SIGTERM', () => server.close())
process.on('SIGINT', () => server.close())
