const FAST_FOOD_MCC = '5812'
const LIMIT_RANDS = 500
const SPEND_KEY = 'fastfood_spend'

export function beforeTransaction(event, kv) {
  const mcc = String(event?.merchant?.category?.code ?? '')
  if (mcc !== FAST_FOOD_MCC) return { approved: true }

  const current = Number(kv.get(SPEND_KEY) ?? 0)
  const amount = Number(event?.centsAmount ?? 0) / 100
  const projected = current + amount

  if (projected > LIMIT_RANDS) {
    return { approved: false, message: 'Fast-food monthly budget exceeded' }
  }

  return { approved: true }
}

export function afterTransaction(event, kv) {
  const mcc = String(event?.merchant?.category?.code ?? '')
  if (mcc !== FAST_FOOD_MCC) return

  const current = Number(kv.get(SPEND_KEY) ?? 0)
  const amount = Number(event?.centsAmount ?? 0) / 100
  kv.set(SPEND_KEY, current + amount)
}

