import { createHash, createHmac, timingSafeEqual } from 'crypto'

export const GENESIS_HASH = '0'.repeat(64)
export const REPLAY_TOLERANCE_SECONDS = 300

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

function signatureValid(signatureHeader, timestamp, rawBody, secret) {
  if (typeof signatureHeader !== 'string' || !signatureHeader.startsWith('sha256=')) return false

  const receivedHex = signatureHeader.slice('sha256='.length)
  if (!/^[0-9a-f]+$/i.test(receivedHex)) return false

  const expected = Buffer.from(
    createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex'),
    'hex'
  )
  const received = Buffer.from(receivedHex, 'hex')
  return expected.length === received.length && timingSafeEqual(expected, received)
}

function isFresh(rawTimestamp, nowSeconds) {
  if (!/^\d+$/.test(String(rawTimestamp))) return false
  return Math.abs(nowSeconds - Number(rawTimestamp)) <= REPLAY_TOLERANCE_SECONDS
}

function callbackAllowed(input, allowedHosts) {
  let url
  try {
    url = new URL(String(input))
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.port !== '' && url.port !== '443') return false
  return allowedHosts.map((host) => host.toLowerCase()).includes(url.hostname.toLowerCase())
}

export function processWebhook(request, context) {
  const headers = request?.headers ?? {}
  const deliveryId = headers['x-investec-delivery-id']
  const timestamp = headers['x-investec-timestamp']
  const signature = headers['x-investec-signature']
  const rawBody = request?.rawBody

  const decide = (status, reason = null) => {
    appendAuditEntry(context.auditLog, {
      deliveryId: typeof deliveryId === 'string' ? deliveryId : null,
      status,
      reason,
    })
    return reason ? { status, reason } : { status }
  }

  if (typeof deliveryId !== 'string' || deliveryId.length === 0 || timestamp === undefined || timestamp === null || !signature) {
    return decide('rejected', 'missing-headers')
  }

  if (!signatureValid(signature, timestamp, rawBody, context.secret)) {
    return decide('rejected', 'invalid-signature')
  }

  if (!isFresh(timestamp, context.nowSeconds)) {
    return decide('rejected', 'stale')
  }

  if (context.seenDeliveryIds.has(deliveryId)) {
    return decide('rejected', 'duplicate')
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return decide('rejected', 'malformed-body')
  }

  if (body && typeof body === 'object' && body.callbackUrl !== undefined) {
    if (!callbackAllowed(body.callbackUrl, context.allowedCallbackHosts)) {
      return decide('rejected', 'callback-not-allowed')
    }
  }

  context.seenDeliveryIds.add(deliveryId)
  return decide('accepted')
}
