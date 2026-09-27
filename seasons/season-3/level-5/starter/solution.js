import { createHash, createHmac } from 'crypto'

export const GENESIS_HASH = '0'.repeat(64)

export function appendAuditEntry(log, event) {
  const index = log.length
  const prevHash = index === 0 ? GENESIS_HASH : log[index - 1].hash
  const hash = createHash('sha256')
    .update(`${index}|${prevHash}|${JSON.stringify(event)}`)
    .digest('hex')
  const entry = { index, event, prevHash, hash }
  log.push(entry)
  return entry
}

export function processWebhook(request, context) {
  const headers = request?.headers ?? {}
  const deliveryId = headers['x-investec-delivery-id']
  const timestamp = headers['x-investec-timestamp']
  const signature = headers['x-investec-signature']

  if (!deliveryId || !timestamp || !signature) {
    return { status: 'rejected', reason: 'missing-headers' }
  }

  if (context.seenDeliveryIds.has(deliveryId)) {
    return { status: 'rejected', reason: 'duplicate' }
  }
  context.seenDeliveryIds.add(deliveryId)

  const expected = createHmac('sha256', context.secret)
    .update(`${timestamp}.${request.rawBody}`)
    .digest('hex')
  if (!signature.startsWith('sha256=') || !expected.startsWith(signature.slice('sha256='.length))) {
    return { status: 'rejected', reason: 'invalid-signature' }
  }

  let body
  try {
    body = JSON.parse(request.rawBody)
  } catch {
    return { status: 'rejected', reason: 'malformed-body' }
  }

  if (body.callbackUrl && !context.allowedCallbackHosts.some((host) => body.callbackUrl.includes(host))) {
    return { status: 'rejected', reason: 'callback-not-allowed' }
  }

  appendAuditEntry(context.auditLog, { deliveryId, status: 'accepted', reason: null })
  return { status: 'accepted' }
}
