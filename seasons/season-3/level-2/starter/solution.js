export function acceptDelivery(headers, nowSeconds, seen) {
  const deliveryId = headers?.['x-investec-delivery-id']
  const timestamp = headers?.['x-investec-timestamp']

  if (!deliveryId || !timestamp) {
    return { accepted: false, reason: 'missing-headers' }
  }

  if (seen.has(deliveryId)) {
    return { accepted: false, reason: 'duplicate' }
  }

  return { accepted: true }
}
