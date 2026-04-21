const WINDOW_MS = 60_000
const MAX_IN_WINDOW = 3
const KEY = 'velocity_timestamps'

export function beforeTransaction(event, kv) {
  const now = new Date(event?.dateTime ?? Date.now()).getTime()
  const existing = Array.isArray(kv.get(KEY)) ? kv.get(KEY) : []
  const recent = existing.filter((t) => now - t <= WINDOW_MS)

  if (recent.length >= MAX_IN_WINDOW) {
    kv.set(KEY, recent)
    return { approved: false, message: 'Velocity limit exceeded' }
  }

  recent.push(now)
  kv.set(KEY, recent)
  return { approved: true }
}

