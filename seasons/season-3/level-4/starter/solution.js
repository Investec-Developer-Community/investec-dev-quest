import { createHash } from 'crypto'

export const GENESIS_HASH = '0'.repeat(64)

export function hashEntry(index, prevHash, event) {
  return createHash('sha256')
    .update(`${index}|${prevHash}|${JSON.stringify(event)}`)
    .digest('hex')
}

export function appendEntry(log, event) {
  const index = log.length
  const prevHash = index === 0 ? GENESIS_HASH : log[index - 1].hash
  const entry = { index, event, prevHash, hash: hashEntry(index, prevHash, event) }
  log.push(entry)
  return entry
}

export function verifyChain(log) {
  for (const entry of log) {
    if (entry.hash !== hashEntry(entry.index, entry.prevHash, entry.event)) {
      return { valid: false }
    }
  }
  return { valid: true }
}
