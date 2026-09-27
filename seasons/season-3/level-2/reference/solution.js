export const REPLAY_TOLERANCE_SECONDS = 300

export function acceptDelivery(headers, nowSeconds, seen, toleranceSeconds = REPLAY_TOLERANCE_SECONDS) {
  const deliveryId = headers?.['x-investec-delivery-id']
  const rawTimestamp = headers?.['x-investec-timestamp']

  if (typeof deliveryId !== 'string' || deliveryId.length === 0 || rawTimestamp === undefined || rawTimestamp === null) {
    return { accepted: false, reason: 'missing-headers' }
  }

  if (!/^\d+$/.test(String(rawTimestamp))) {
    return { accepted: false, reason: 'invalid-timestamp' }
  }

  const timestamp = Number(rawTimestamp)
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return { accepted: false, reason: 'stale' }
  }

  if (seen.has(deliveryId)) {
    return { accepted: false, reason: 'duplicate' }
  }

  seen.add(deliveryId)
  return { accepted: true }
}
