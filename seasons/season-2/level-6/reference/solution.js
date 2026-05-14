const BLOCKED_MCCS = new Set([5816, 7995])
const ALLOWED_COUNTRIES = new Set(['ZA', 'NA'])
const DAILY_LIMIT_RANDS = 2000
const FAST_FOOD_MCC = '5812'
const FAST_FOOD_LIMIT_RANDS = 500
const WINDOW_MS = 60_000
const MAX_IN_WINDOW = 3

export function beforeTransaction(event, kv) {
  const mcc = Number(event?.merchant?.category?.code)
  const country = String(event?.merchant?.country?.code ?? '').trim().toUpperCase()
  const amount = Number(event?.centsAmount ?? 0) / 100
  const now = new Date(event?.dateTime ?? Date.now()).getTime()

  if (BLOCKED_MCCS.has(mcc)) {
    return { approved: false, message: 'Restricted merchant category' }
  }

  if (!country || !ALLOWED_COUNTRIES.has(country)) {
    return { approved: false, message: 'Country not allowed' }
  }

  const existing = Array.isArray(kv.get('velocity_timestamps')) ? kv.get('velocity_timestamps') : []
  const recent = existing.filter((t) => now - t <= WINDOW_MS)

  if (recent.length >= MAX_IN_WINDOW) {
    kv.set('velocity_timestamps', recent)
    return { approved: false, message: 'Velocity limit exceeded' }
  }

  const currentDaily = Number(kv.get('daily_spend') ?? 0)
  const projectedDaily = currentDaily + amount
  if (projectedDaily > DAILY_LIMIT_RANDS) {
    kv.set('velocity_timestamps', recent)
    return { approved: false, message: 'Daily spend limit exceeded' }
  }

  const mccCode = String(event?.merchant?.category?.code ?? '')
  if (mccCode === FAST_FOOD_MCC) {
    const currentFastFood = Number(kv.get('fastfood_spend') ?? 0)
    if (currentFastFood + amount > FAST_FOOD_LIMIT_RANDS) {
      kv.set('velocity_timestamps', recent)
      return { approved: false, message: 'Fast-food monthly budget exceeded' }
    }
  }

  recent.push(now)
  kv.set('velocity_timestamps', recent)
  kv.set('daily_spend', projectedDaily)

  return { approved: true }
}

export function afterTransaction(event, kv) {
  const mcc = String(event?.merchant?.category?.code ?? '')
  if (mcc !== FAST_FOOD_MCC) return

  const amount = Number(event?.centsAmount ?? 0) / 100
  const current = Number(kv.get('fastfood_spend') ?? 0)
  kv.set('fastfood_spend', current + amount)
}
