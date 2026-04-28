export function beforeTransaction(event, kv) {
  return { approved: true }
}

export function afterTransaction(event, kv) {
  const mcc = String(event?.merchant?.category?.code ?? '')
  if (mcc !== '5812') return

  const current = Number(kv.get('fastfood_spend') ?? 0)
  const amount = Number(event?.centsAmount ?? 0) / 100
  kv.set('fastfood_spend', current + amount)
}

