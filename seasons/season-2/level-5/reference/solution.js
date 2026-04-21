const DAILY_LIMIT_RANDS = 2000
const KEY = 'daily_spend'

export function beforeTransaction(event, kv) {
  const current = Number(kv.get(KEY) ?? 0)
  const amount = Number(event?.centsAmount ?? 0) / 100
  const projected = current + amount

  if (projected > DAILY_LIMIT_RANDS) {
    return { approved: false, message: 'Daily spend limit exceeded' }
  }

  kv.set(KEY, projected)
  return { approved: true }
}

