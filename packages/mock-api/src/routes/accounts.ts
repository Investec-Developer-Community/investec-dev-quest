import { Hono } from 'hono'
import { ACCOUNTS, BALANCES, BENEFICIARIES, paginate } from '../data/fixtures.js'

export const accountsRouter = new Hono()

// GET /za/pb/v1/accounts
accountsRouter.get('/', (c) => {
  const cursor = c.req.query('cursor') ?? null
  const pageSize = parseInt(c.req.query('pageSize') ?? '10', 10)

  const { page, nextCursor } = paginate(ACCOUNTS, cursor, pageSize)

  return c.json({
    data: {
      accounts: page,
    },
    links: {
      self: `/za/pb/v1/accounts`,
      ...(nextCursor ? { next: `/za/pb/v1/accounts?cursor=${nextCursor}` } : {}),
    },
    meta: {
      totalPages: 1,
      nextCursor,
    },
  })
})

// GET /za/pb/v1/accounts/:accountId/balance
accountsRouter.get('/:accountId/balance', (c) => {
  const { accountId } = c.req.param()
  const balance = BALANCES[accountId]

  if (!balance) {
    return c.json({ error: 'Account not found' }, 404)
  }

  return c.json({
    data: balance,
    links: { self: `/za/pb/v1/accounts/${accountId}/balance` },
    meta: {},
  })
})

// GET /za/pb/v1/accounts/beneficiaries
accountsRouter.get('/beneficiaries', (c) => {
  return c.json({
    data: BENEFICIARIES,
    links: { self: '/za/pb/v1/accounts/beneficiaries' },
    meta: { count: BENEFICIARIES.length },
  })
})
