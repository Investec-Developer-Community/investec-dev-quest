export function beforeTransaction(event, kv) {
  const current = Number(kv.get('daily_spend') ?? 0)
  const amount = Number(event?.centsAmount ?? 0) / 100
  const projected = current + amount

  kv.set('daily_spend', projected)

  if (projected > 2000) {
    return { approved: false, message: 'Daily spend limit exceeded' }
  }

  return { approved: true }
}

